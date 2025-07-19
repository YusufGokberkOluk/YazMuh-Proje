const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'étude API Documentation',
      version: '1.0.0',
      description: 'Comprehensive API documentation for étude - AI-powered collaborative text editor',
      contact: {
        name: 'API Support',
        email: 'support@etude.app'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server'
      },
      {
        url: 'https://api.etude.app',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'User ID',
              example: '507f1f77bcf86cd799439011'
            },
            username: {
              type: 'string',
              description: 'Username',
              example: 'johndoe'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email',
              example: 'john@example.com'
            },
            workspaces: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Array of workspace IDs'
            },
            favoritePages: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Array of favorite page IDs'
            },
            preferences: {
              type: 'object',
              properties: {
                theme: {
                  type: 'string',
                  enum: ['light', 'dark'],
                  default: 'light'
                },
                language: {
                  type: 'string',
                  default: 'en'
                }
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Workspace: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            name: {
              type: 'string',
              description: 'Workspace name',
              example: 'My Workspace'
            },
            description: {
              type: 'string',
              description: 'Workspace description'
            },
            owner: {
              type: 'string',
              description: 'Owner user ID'
            },
            members: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  user: {
                    type: 'string',
                    description: 'User ID'
                  },
                  role: {
                    type: 'string',
                    enum: ['admin', 'editor', 'viewer'],
                    default: 'viewer'
                  },
                  joinedAt: {
                    type: 'string',
                    format: 'date-time'
                  }
                }
              }
            },
            pages: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Array of page IDs'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Page: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            title: {
              type: 'string',
              description: 'Page title',
              example: 'My Document'
            },
            content: {
              type: 'string',
              description: 'Page content'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Page tags'
            },
            owner: {
              type: 'string',
              description: 'Owner user ID'
            },
            workspace: {
              type: 'string',
              description: 'Workspace ID'
            },
            permissions: {
              type: 'object',
              properties: {
                isPublic: {
                  type: 'boolean',
                  default: false
                },
                shareLink: {
                  type: 'string',
                  description: 'Public share link'
                },
                invitedUsers: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      user: {
                        type: 'string',
                        description: 'User ID'
                      },
                      role: {
                        type: 'string',
                        enum: ['editor', 'viewer'],
                        default: 'viewer'
                      }
                    }
                  }
                }
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Block: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            type: {
              type: 'string',
              enum: ['text', 'heading1', 'heading2', 'heading3', 'list', 'code', 'quote', 'image', 'checklist'],
              description: 'Block type'
            },
            content: {
              type: 'object',
              description: 'Block content (varies by type)'
            },
            page: {
              type: 'string',
              description: 'Page ID'
            },
            parent: {
              type: 'string',
              description: 'Parent block ID (for nested blocks)'
            },
            order: {
              type: 'number',
              description: 'Display order'
            },
            createdBy: {
              type: 'string',
              description: 'Creator user ID'
            },
            lastModifiedBy: {
              type: 'string',
              description: 'Last modifier user ID'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Comment: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            content: {
              type: 'string',
              description: 'Comment content'
            },
            page: {
              type: 'string',
              description: 'Page ID'
            },
            block: {
              type: 'string',
              description: 'Block ID (optional)'
            },
            author: {
              type: 'string',
              description: 'Author user ID'
            },
            parent: {
              type: 'string',
              description: 'Parent comment ID (for replies)'
            },
            mentions: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Mentioned user IDs'
            },
            isResolved: {
              type: 'boolean',
              default: false
            },
            resolvedBy: {
              type: 'string',
              description: 'User ID who resolved the comment'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Request success status'
            },
            message: {
              type: 'string',
              description: 'Response message'
            },
            data: {
              type: 'object',
              description: 'Response data'
            },
            error: {
              type: 'string',
              description: 'Error message (development only)'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Error message'
            },
            error: {
              type: 'string',
              description: 'Detailed error (development only)'
            }
          }
        }
      },
      responses: {
        Success: {
          description: 'Successful response',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ApiResponse'
              }
            }
          }
        },
        BadRequest: {
          description: 'Bad request',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        Unauthorized: {
          description: 'Unauthorized - Invalid or missing token',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        Forbidden: {
          description: 'Forbidden - Insufficient permissions',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        InternalServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './routes/*.js',
    './controllers/*.js'
  ]
};

const specs = swaggerJSDoc(options);

module.exports = specs; 