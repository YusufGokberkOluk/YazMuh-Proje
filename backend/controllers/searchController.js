const Page = require('../models/Page');
const Block = require('../models/Block');
const User = require('../models/User');
const Workspace = require('../models/Workspace');
const { getCache, setCache } = require('../config/redis');

// Tam metin araması
const searchContent = async (req, res) => {
  try {
    const { q, type, workspaceId, page = 1, limit = 20 } = req.query;
    const userId = req.user._id;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Arama terimi en az 2 karakter olmalıdır'
      });
    }

    // Cache'den kontrol et
    const cacheKey = `search:${q}:${type}:${workspaceId}:${page}:${limit}:${userId}`;
    const cachedResults = await getCache(cacheKey);
    
    if (cachedResults) {
      return res.json({
        success: true,
        data: cachedResults,
        message: 'Arama sonuçları cache\'den getirildi'
      });
    }

    const skip = (page - 1) * limit;
    const searchTerm = q.trim();
    const results = {
      pages: [],
      blocks: [],
      users: [],
      workspaces: []
    };

    // Sayfa araması
    if (!type || type === 'pages') {
      const pageQuery = {
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { content: { $regex: searchTerm, $options: 'i' } }
        ]
      };

      if (workspaceId) {
        pageQuery.workspace = workspaceId;
      }

      // Kullanıcının erişebileceği sayfaları filtrele
      const accessiblePages = await Page.find({
        $or: [
          { owner: userId },
          { 'permissions.invitedUsers.user': userId }
        ]
      }).select('_id');

      pageQuery._id = { $in: accessiblePages.map(p => p._id) };

      const pages = await Page.find(pageQuery)
        .populate('owner', 'username email avatar')
        .populate('workspace', 'name')
        .populate('tags', 'name color')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      results.pages = pages;
    }

    // Blok araması
    if (!type || type === 'blocks') {
      const blockQuery = {
        $or: [
          { 'content.text': { $regex: searchTerm, $options: 'i' } },
          { 'content.title': { $regex: searchTerm, $options: 'i' } }
        ]
      };

      // Kullanıcının erişebileceği sayfalardaki blokları filtrele
      const accessiblePages = await Page.find({
        $or: [
          { owner: userId },
          { 'permissions.invitedUsers.user': userId }
        ]
      }).select('_id');

      blockQuery.page = { $in: accessiblePages.map(p => p._id) };

      const blocks = await Block.find(blockQuery)
        .populate('page', 'title')
        .populate('createdBy', 'username email avatar')
        .populate('lastModifiedBy', 'username email avatar')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      results.blocks = blocks;
    }

    // Kullanıcı araması (sadece workspace içinde)
    if (!type || type === 'users') {
      if (workspaceId) {
        const workspace = await Workspace.findById(workspaceId);
        if (workspace) {
          const userQuery = {
            _id: { $in: workspace.members },
            $or: [
              { username: { $regex: searchTerm, $options: 'i' } },
              { email: { $regex: searchTerm, $options: 'i' } },
              { fullName: { $regex: searchTerm, $options: 'i' } }
            ]
          };

          const users = await User.find(userQuery)
            .select('username email fullName avatar')
            .sort({ username: 1 })
            .skip(skip)
            .limit(parseInt(limit));

          results.users = users;
        }
      }
    }

    // Workspace araması
    if (!type || type === 'workspaces') {
      const workspaceQuery = {
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } }
        ],
        members: userId
      };

      const workspaces = await Workspace.find(workspaceQuery)
        .populate('owner', 'username email avatar')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      results.workspaces = workspaces;
    }

    // Toplam sayıları hesapla
    const totalCounts = {
      pages: 0,
      blocks: 0,
      users: 0,
      workspaces: 0
    };

    if (!type || type === 'pages') {
      const pageQuery = {
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { content: { $regex: searchTerm, $options: 'i' } }
        ]
      };

      if (workspaceId) {
        pageQuery.workspace = workspaceId;
      }

      const accessiblePages = await Page.find({
        $or: [
          { owner: userId },
          { 'permissions.invitedUsers.user': userId }
        ]
      }).select('_id');

      pageQuery._id = { $in: accessiblePages.map(p => p._id) };
      totalCounts.pages = await Page.countDocuments(pageQuery);
    }

    if (!type || type === 'blocks') {
      const blockQuery = {
        $or: [
          { 'content.text': { $regex: searchTerm, $options: 'i' } },
          { 'content.title': { $regex: searchTerm, $options: 'i' } }
        ]
      };

      const accessiblePages = await Page.find({
        $or: [
          { owner: userId },
          { 'permissions.invitedUsers.user': userId }
        ]
      }).select('_id');

      blockQuery.page = { $in: accessiblePages.map(p => p._id) };
      totalCounts.blocks = await Block.countDocuments(blockQuery);
    }

    if (!type || type === 'users' && workspaceId) {
      const workspace = await Workspace.findById(workspaceId);
      if (workspace) {
        const userQuery = {
          _id: { $in: workspace.members },
          $or: [
            { username: { $regex: searchTerm, $options: 'i' } },
            { email: { $regex: searchTerm, $options: 'i' } },
            { fullName: { $regex: searchTerm, $options: 'i' } }
          ]
        };
        totalCounts.users = await User.countDocuments(userQuery);
      }
    }

    if (!type || type === 'workspaces') {
      const workspaceQuery = {
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } }
        ],
        members: userId
      };
      totalCounts.workspaces = await Workspace.countDocuments(workspaceQuery);
    }

    const searchResults = {
      query: searchTerm,
      results,
      totalCounts,
      pagination: {
        currentPage: parseInt(page),
        itemsPerPage: parseInt(limit),
        totalPages: Math.ceil(Math.max(...Object.values(totalCounts)) / limit)
      }
    };

    // Cache'e kaydet (10 dakika)
    await setCache(cacheKey, searchResults, 600);

    res.json({
      success: true,
      data: searchResults,
      message: 'Arama tamamlandı'
    });
  } catch (error) {
    console.error('Arama hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Arama yapılamadı',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Gelişmiş arama (filtrelerle)
const advancedSearch = async (req, res) => {
  try {
    const {
      q,
      type,
      workspaceId,
      tags,
      dateFrom,
      dateTo,
      author,
      page = 1,
      limit = 20,
      sortBy = 'relevance'
    } = req.query;

    const userId = req.user._id;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Arama terimi en az 2 karakter olmalıdır'
      });
    }

    const searchTerm = q.trim();
    const query = {
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { content: { $regex: searchTerm, $options: 'i' } }
      ]
    };

    // Workspace filtresi
    if (workspaceId) {
      query.workspace = workspaceId;
    }

    // Tag filtresi
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    // Tarih filtresi
    if (dateFrom || dateTo) {
      query.updatedAt = {};
      if (dateFrom) query.updatedAt.$gte = new Date(dateFrom);
      if (dateTo) query.updatedAt.$lte = new Date(dateTo);
    }

    // Yazar filtresi
    if (author) {
      const authorUser = await User.findOne({ username: author });
      if (authorUser) {
        query.owner = authorUser._id;
      }
    }

    // Kullanıcının erişebileceği sayfaları filtrele
    const accessiblePages = await Page.find({
      $or: [
        { owner: userId },
        { 'permissions.invitedUsers.user': userId }
      ]
    }).select('_id');

    query._id = { $in: accessiblePages.map(p => p._id) };

    // Sıralama
    let sortOptions = {};
    switch (sortBy) {
      case 'date':
        sortOptions = { updatedAt: -1 };
        break;
      case 'title':
        sortOptions = { title: 1 };
        break;
      case 'author':
        sortOptions = { 'owner.username': 1 };
        break;
      default: // relevance
        sortOptions = { score: { $meta: 'textScore' } };
        break;
    }

    const skip = (page - 1) * limit;

    const pages = await Page.find(query)
      .populate('owner', 'username email avatar')
      .populate('workspace', 'name')
      .populate('tags', 'name color')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Page.countDocuments(query);

    const results = {
      pages,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      },
      filters: {
        query: searchTerm,
        type,
        workspaceId,
        tags: tags ? tags.split(',') : [],
        dateFrom,
        dateTo,
        author,
        sortBy
      }
    };

    res.json({
      success: true,
      data: results,
      message: 'Gelişmiş arama tamamlandı'
    });
  } catch (error) {
    console.error('Gelişmiş arama hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Gelişmiş arama yapılamadı',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Arama önerileri
const getSearchSuggestions = async (req, res) => {
  try {
    const { q, type = 'pages' } = req.query;
    const userId = req.user._id;

    if (!q || q.trim().length < 1) {
      return res.json({
        success: true,
        data: [],
        message: 'Arama önerisi için en az 1 karakter gerekli'
      });
    }

    const searchTerm = q.trim();

    let suggestions = [];

    if (type === 'pages') {
      const accessiblePages = await Page.find({
        $or: [
          { owner: userId },
          { 'permissions.invitedUsers.user': userId }
        ]
      }).select('_id');

      const pages = await Page.find({
        _id: { $in: accessiblePages.map(p => p._id) },
        title: { $regex: searchTerm, $options: 'i' }
      })
        .select('title')
        .limit(5);

      suggestions = pages.map(page => ({
        type: 'page',
        title: page.title,
        value: page.title
      }));
    } else if (type === 'users') {
      const users = await User.find({
        username: { $regex: searchTerm, $options: 'i' }
      })
        .select('username fullName')
        .limit(5);

      suggestions = users.map(user => ({
        type: 'user',
        title: user.fullName || user.username,
        value: user.username
      }));
    }

    res.json({
      success: true,
      data: suggestions,
      message: 'Arama önerileri getirildi'
    });
  } catch (error) {
    console.error('Arama önerisi hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Arama önerileri getirilemedi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  searchContent,
  advancedSearch,
  getSearchSuggestions
}; 