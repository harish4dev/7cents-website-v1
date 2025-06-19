// components/ToolCard.tsx
import { useCartStore } from '@/stores/userCartStore';
import { useRouter } from 'next/navigation';

interface ToolCardProps {
  id: string;
  name: string;
  description: string;
  iconUrl?: string | null;
  authProvider: string;
  authRequired: boolean;
  isSubscribed?: boolean; // New prop to check if user has subscribed
}

const ToolCard = ({ 
  id, 
  name, 
  description, 
  iconUrl, 
  authProvider, 
  authRequired,
  isSubscribed = false 
}: ToolCardProps) => {
  const { addToCart, removeFromCart, cart } = useCartStore();
  const router = useRouter();
  
  const isInCart = cart.some(item => item.id === id);

  const handleCartAction = () => {
    if (isInCart) {
      removeFromCart(id);
    } else {
      addToCart({
        id,
        name,
        description,
        authProvider,
        authRequired
      });
    }
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden">
      <div className="p-6">
        {/* Tool Icon */}
        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl mb-4 mx-auto">
          {iconUrl ? (
            <img 
              src={iconUrl} 
              alt={`${name} icon`}
              className="w-10 h-10 object-contain"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Tool Info */}
        <div className="text-center mb-6">
          <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-1">
            {name}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-3 mb-4">
            {description}
          </p>
          
          {/* Provider and Auth Status */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {authProvider}
            </span>
            {authRequired && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Auth Required
              </span>
            )}
            {isSubscribed && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ✓ Subscribed
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        {isSubscribed ? (
          <button
            onClick={handleGoToDashboard}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center justify-center space-x-2">
              <span>Go to Dashboard</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </button>
        ) : (
          <button
            onClick={handleCartAction}
            className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl ${
              isInCart
                ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-700 hover:to-pink-700'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              {isInCart ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Remove from Cart</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.68 8.32M7 13v8a2 2 0 002 2h6a2 2 0 002-2v-8m-8 0V9a2 2 0 012-2h4a2 2 0 012 2v4.01" />
                  </svg>
                  <span>Add to Cart</span>
                </>
              )}
            </div>
          </button>
        )}
      </div>
    </div>
  );
};

export default ToolCard;