import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Utensils, 
  Clock, 
  Users, 
  Star, 
  ShoppingCart,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <img 
                src="/src/assets/SXEC canteen.png" 
                alt="SXEC Canteen Logo" 
                className="h-8 w-8 object-contain"
              />
              <span className="ml-2 text-2xl font-bold text-gray-900">
                SXEC Canteen
              </span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-500 hover:text-gray-900">
                Features
              </a>
              <a href="#about" className="text-gray-500 hover:text-gray-900">
                About
              </a>
              <a href="#contact" className="text-gray-500 hover:text-gray-900">
                Contact
              </a>
            </nav>
            <div className="flex space-x-4">
              <Link
                to="/login"
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Delicious Food
              <span className="text-orange-600 block">Made Simple</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Experience hassle-free canteen management with our modern platform. 
              Order your favorite meals, track availability in real-time, and enjoy 
              seamless food service like never before.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-orange-600 text-white px-8 py-4 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center"
              >
                Start Ordering Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/menu"
                className="border-2 border-orange-600 text-orange-600 px-8 py-4 rounded-lg hover:bg-orange-50 transition-colors flex items-center justify-center"
              >
                View Menu
                <Utensils className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Canteen System?
            </h2>
            <p className="text-xl text-gray-600">
              Built for modern food service with cutting-edge features
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Real-Time Availability
              </h3>
              <p className="text-gray-600">
                See live updates on food availability and never face disappointment. 
                Know exactly what's available before you order.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Easy Ordering
              </h3>
              <p className="text-gray-600">
                Simple, intuitive interface makes ordering your favorite meals 
                quick and effortless. Add to cart and checkout in seconds.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Admin Dashboard
              </h3>
              <p className="text-gray-600">
                Comprehensive admin panel for managing menu items, tracking orders, 
                and monitoring canteen operations efficiently.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Preview Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Popular Menu Items
            </h2>
            <p className="text-xl text-gray-600">
              Discover our most loved dishes
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { name: 'Veg Thali', price: '₹120', rating: 4.8 },
              { name: 'Chicken Biryani', price: '₹180', rating: 4.9 },
              { name: 'Masala Dosa', price: '₹80', rating: 4.7 },
              { name: 'Paneer Butter Masala', price: '₹150', rating: 4.6 },
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-orange-200 to-red-200"></div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{item.name}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-orange-600 font-bold">{item.price}</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm text-gray-600">{item.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/menu"
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors inline-flex items-center"
            >
              View Full Menu
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Experience the Future of Canteen Service
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our platform revolutionizes how you interact with canteen services. 
                From seamless ordering to real-time updates, we've got everything covered.
              </p>
              
              <div className="space-y-4">
                {[
                  'Real-time menu availability updates',
                  'Secure user authentication & profiles',
                  'Order tracking and history',
                  'Admin dashboard for complete control',
                  'Mobile-friendly responsive design'
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-lg p-8">
              <div className="text-center">
                <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <Utensils className="h-12 w-12 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Ready to Get Started?
                </h3>
                <p className="text-gray-600 mb-6">
                  Join hundreds of satisfied customers who have transformed their canteen experience.
                </p>
                <Link
                  to="/register"
                  className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors inline-block"
                >
                  Create Your Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <img 
                  src="/src/assets/SXEC canteen.png" 
                  alt="SXEC Canteen Logo" 
                  className="h-6 w-6 object-contain"
                />
                <span className="ml-2 text-xl font-bold">SXEC Canteen</span>
              </div>
              <p className="text-gray-400">
                Making canteen services simple, efficient, and delightful for everyone.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/menu" className="hover:text-white">Menu</Link></li>
                <li><Link to="/login" className="hover:text-white">Sign In</Link></li>
                <li><Link to="/register" className="hover:text-white">Register</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Real-time Updates</li>
                <li>Easy Ordering</li>
                <li>Admin Dashboard</li>
                <li>Order Tracking</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="text-gray-400">
                <p>support@canteenmanagement.com</p>
                <p>+1 (555) 123-4567</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Canteen Management System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
