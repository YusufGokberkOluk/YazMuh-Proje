export default function TestCSS() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold text-blue-600 mb-8">CSS Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Colors Test */}
        <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Basic Colors</h2>
          <div className="flex gap-2">
            <div className="w-8 h-8 bg-red-500 rounded"></div>
            <div className="w-8 h-8 bg-blue-500 rounded"></div>
            <div className="w-8 h-8 bg-green-500 rounded"></div>
            <div className="w-8 h-8 bg-yellow-500 rounded"></div>
          </div>
        </div>
        
        {/* Custom étude Colors Test */}
        <div className="p-4 bg-etude-secondary border border-etude-accent rounded-lg">
          <h2 className="text-xl font-semibold text-etude-dark mb-2">Custom étude Colors</h2>
          <div className="flex gap-2">
            <div className="w-8 h-8 bg-etude-primary rounded"></div>
            <div className="w-8 h-8 bg-etude-secondary rounded"></div>
            <div className="w-8 h-8 bg-etude-accent rounded"></div>
            <div className="w-8 h-8 bg-etude-dark rounded"></div>
          </div>
        </div>
        
        {/* Typography Test */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Typography</h2>
          <p className="text-lg text-gray-700">Large text</p>
          <p className="text-base text-gray-600">Normal text</p>
          <p className="text-sm text-gray-500">Small text</p>
        </div>
        
        {/* Layout Test */}
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h2 className="text-xl font-semibold text-purple-800 mb-2">Layout</h2>
          <div className="flex justify-between items-center">
            <span className="text-purple-600">Flex layout</span>
            <button className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
              Button
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 