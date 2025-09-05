import { Link } from 'react-router-dom';
import { openLoginModal } from '../components/forms/LoginModal';
import { 
  DocumentTextIcon, 
  CpuChipIcon, 
  CloudUploadIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  PlayIcon,
  ShieldCheckIcon,
  BoltIcon,
  ChartBarIcon
} from '../components/ui/Icons';
import Button from '../components/ui/Button';

// Landing page component with production-ready SaaS design
function Landing() {

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <DocumentTextIcon className="h-5 w-5 text-white" />
                </div>
                <h1 className="ml-3 text-xl font-bold text-gray-900">Invoice Parser</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={openLoginModal}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Sign In
              </button>
              <Link to="/register">
                <Button size="sm">
                  Try for Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-violet-50 via-white to-blue-50 pt-16 pb-20 sm:pt-24 sm:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              {/* Trust Badge */}
              <div className="inline-flex items-center bg-violet-100 text-violet-800 text-sm font-medium px-3 py-1 rounded-full mb-6">
                <ShieldCheckIcon className="h-4 w-4 mr-2" />
                SOC 2 Compliant • GDPR Ready
              </div>
              
              {/* Main Headline */}
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl lg:text-6xl">
                Process invoices in{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600">
                  seconds
                </span>
                {' '}not hours
              </h1>
              
              {/* Subheadline */}
              <p className="mt-6 text-xl text-gray-600 max-w-3xl">
                AI-powered OCR technology that extracts data from your invoices automatically. 
                Reduce manual data entry by <strong>95%</strong> and eliminate costly errors.
              </p>

              {/* Key Benefits */}
              <div className="mt-8 space-y-3">
                <div className="flex items-center text-gray-700">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                  <span>Process 100+ invoices per hour</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                  <span>99.5% accuracy with AI validation</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                  <span>Secure cloud processing & storage</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="mt-10 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow">
                  <Link to="/register">
                    <Button size="xl" className="w-full sm:w-auto px-8 py-4 text-lg">
                      Start Free Trial
                      <ArrowRightIcon className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-4">
                  <Button variant="outline" size="xl" className="w-full sm:w-auto px-8 py-4 text-lg">
                    <PlayIcon className="mr-2 h-5 w-5" />
                    Watch Demo
                  </Button>
                </div>
              </div>

              {/* Trust Indicators */}
              <p className="mt-6 text-sm text-gray-500">
                No credit card required • Process 10 invoices free • Setup in under 2 minutes
              </p>
            </div>

            {/* Hero Image/Demo */}
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="relative mx-auto w-full rounded-lg shadow-2xl lg:max-w-md">
                {/* Sample Invoice Demo */}
                <div className="bg-white rounded-lg border-2 border-gray-200 p-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <div className="border-b border-gray-200 pb-4 mb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">INVOICE</h3>
                        <p className="text-sm text-gray-600">#INV-2024-001</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Date: 2024-12-05</p>
                        <p className="text-sm text-gray-600">Due: 2024-12-20</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Web Development Services</span>
                      <span className="font-medium">$2,500.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">UI/UX Design</span>
                      <span className="font-medium">$1,200.00</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-violet-600">$3,700.00</span>
                    </div>
                  </div>
                  
                  {/* AI Processing Indicator */}
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                      <span className="text-sm text-green-800 font-medium">AI Extracted in 2.3s</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
              Trusted by 10,000+ businesses worldwide
            </p>
            
            {/* Stats */}
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">50M+</div>
                <div className="text-sm text-gray-600">Invoices Processed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">99.5%</div>
                <div className="text-sm text-gray-600">Accuracy Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">2.3s</div>
                <div className="text-sm text-gray-600">Average Processing Time</div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="mt-12 max-w-3xl mx-auto">
              <blockquote className="text-lg text-gray-700 italic">
                "Invoice Parser reduced our AP processing time from 4 hours to 15 minutes. 
                The accuracy is incredible and our team can focus on strategic work instead of data entry."
              </blockquote>
              <div className="mt-4 flex items-center justify-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-violet-500 flex items-center justify-center">
                    <span className="text-white font-medium">SJ</span>
                  </div>
                </div>
                <div className="ml-3 text-left">
                  <div className="text-sm font-medium text-gray-900">Sarah Johnson</div>
                  <div className="text-sm text-gray-600">CFO, TechCorp Solutions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Three simple steps to transform your invoice processing
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-violet-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                <CloudUploadIcon className="h-8 w-8 text-violet-600" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900">1. Upload Invoice</h3>
              <p className="mt-2 text-gray-600">
                Drag and drop your invoice image or PDF. Supports JPG, PNG, and PDF formats up to 10MB.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-violet-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                <CpuChipIcon className="h-8 w-8 text-violet-600" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900">2. AI Processing</h3>
              <p className="mt-2 text-gray-600">
                Our advanced AI extracts all key data points with 99.5% accuracy in under 3 seconds.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-violet-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                <DocumentTextIcon className="h-8 w-8 text-violet-600" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900">3. Export Data</h3>
              <p className="mt-2 text-gray-600">
                Review, edit if needed, and export to your accounting system or download as JSON/CSV.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Powerful features for modern businesses
            </h2>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center">
                <BoltIcon className="h-6 w-6 text-violet-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Lightning Fast</h3>
              <p className="mt-2 text-gray-600">
                Process invoices in seconds, not minutes. Our AI is optimized for speed without sacrificing accuracy.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center">
                <ShieldCheckIcon className="h-6 w-6 text-violet-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Secure & Compliant</h3>
              <p className="mt-2 text-gray-600">
                Bank-level security with SOC 2 Type II compliance. Your data is encrypted and never shared.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="h-6 w-6 text-violet-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Smart Analytics</h3>
              <p className="mt-2 text-gray-600">
                Track processing metrics, identify trends, and optimize your accounts payable workflow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-violet-600">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to transform your invoice processing?
            </h2>
            <p className="mt-4 text-xl text-violet-100">
              Join thousands of businesses saving time and money with AI-powered automation.
            </p>
            
            <div className="mt-8">
              <Link to="/register">
                <Button 
                  variant="secondary" 
                  size="xl" 
                  className="bg-white text-violet-600 hover:bg-gray-50 px-8 py-4 text-lg font-semibold"
                >
                  Start Your Free Trial
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            
            <p className="mt-4 text-sm text-violet-200">
              No setup fees • Cancel anytime • 24/7 support
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="h-5 w-5 text-white" />
              </div>
              <span className="ml-3 text-white font-semibold">Invoice Parser</span>
            </div>
            <div className="flex space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8">
            <p className="text-sm text-gray-400 text-center">
              © 2024 Invoice Parser. All rights reserved. Built with ❤️ for modern businesses.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;