import Link from "next/link";
import { Users, UserCheck, GraduationCap, BookOpen, CreditCard, BarChart3, ArrowRight, Sparkles, Star, Zap, Shield, Rocket } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-amber-50/50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-orange-200/30 to-amber-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 right-20 w-96 h-96 bg-gradient-to-r from-green-200/30 to-blue-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-100/20 to-pink-100/20 rounded-full blur-[100px] animate-pulse delay-2000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative py-24 px-4 min-h-[90vh] flex items-center">
        <div className="container mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/70 backdrop-blur-xl border border-white/30 px-6 py-3 rounded-full shadow-xl mb-8 group hover:shadow-2xl transition-all duration-300">
            <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
              Modern School Information System
            </span>
            <Star className="h-4 w-4 text-amber-500 group-hover:rotate-12 transition-transform duration-300" />
          </div>
          
          {/* Main Heading */}
          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
            <span className="block bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              Welcome to
            </span>
            <span className="block bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent animate-pulse">
              AlphaSIS
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
            Transform your school management with our comprehensive, modern, and intuitive system designed for 
            <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent font-semibold"> students</span>,
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-semibold"> teachers</span>, and
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-semibold"> administrators</span>.
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link 
              href="/login" 
              className="group relative bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:via-amber-600 hover:to-yellow-600 text-white font-bold px-10 py-5 rounded-2xl shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 text-lg overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-3">
                <Rocket className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                <span>Get Started</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-3 transition-transform duration-300" />
              </div>
            </Link>
            
            <Link 
              href="#features" 
              className="group relative bg-white/80 backdrop-blur-xl border border-white/40 hover:bg-white/90 text-gray-700 hover:text-gray-900 font-semibold px-10 py-5 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 text-lg"
            >
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-blue-500 group-hover:text-blue-600 transition-colors duration-300" />
                <span>Explore Features</span>
              </div>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto">
            <div className="group bg-white/70 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-3 transition-transform duration-300">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">99.9%</div>
              <div className="text-gray-600 font-medium">Uptime Reliability</div>
            </div>
            
            <div className="group bg-white/70 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-3 transition-transform duration-300">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">50K+</div>
              <div className="text-gray-600 font-medium">Students Managed</div>
            </div>
            
            <div className="group bg-white/70 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-3 transition-transform duration-300">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">24/7</div>
              <div className="text-gray-600 font-medium">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 px-4 bg-white/50 backdrop-blur-xl">
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-100 to-amber-100 px-4 py-2 rounded-full border border-orange-200 mb-6">
              <Star className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-semibold text-orange-700">Powerful Features</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Comprehensive tools to manage every aspect of your educational institution with modern design and intuitive workflows.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Students Management */}
            <div className="group relative bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl p-8 shadow-2xl hover:shadow-orange-500/20 transition-all duration-500 hover:-translate-y-3 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-amber-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-2xl mb-6 group-hover:rotate-3 transition-transform duration-300">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Student Management</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Comprehensive student records, enrollment tracking, and academic progress monitoring with advanced analytics and intuitive interfaces.
                </p>
                <Link href="/students" className="inline-flex items-center font-semibold text-orange-600 hover:text-orange-700 group-hover:translate-x-2 transition-all duration-300">
                  Manage Students 
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            </div>

            {/* Teachers Management */}
            <div className="group relative bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl p-8 shadow-2xl hover:shadow-green-500/20 transition-all duration-500 hover:-translate-y-3 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl mb-6 group-hover:rotate-3 transition-transform duration-300">
                  <UserCheck className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Teacher Management</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Detailed teacher profiles, qualification tracking, subject assignments, and performance analytics with streamlined workflows.
                </p>
                <Link href="/teachers" className="inline-flex items-center font-semibold text-green-600 hover:text-green-700 group-hover:translate-x-2 transition-all duration-300">
                  Manage Teachers 
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            </div>

            {/* Classes Management */}
            <div className="group relative bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl p-8 shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:-translate-y-3 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-2xl mb-6 group-hover:rotate-3 transition-transform duration-300">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Class Management</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Organize classes efficiently, assign students and teachers, manage academic levels with intelligent automation and reporting.
                </p>
                <Link href="/classes" className="inline-flex items-center font-semibold text-blue-600 hover:text-blue-700 group-hover:translate-x-2 transition-all duration-300">
                  Manage Classes 
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            </div>

            {/* Subjects Management */}
            <div className="group relative bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl p-8 shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:-translate-y-3 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl mb-6 group-hover:rotate-3 transition-transform duration-300">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Subject Management</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Create and manage academic subjects, assign teachers, track curriculum progress with comprehensive oversight and planning tools.
                </p>
                <Link href="/subjects" className="inline-flex items-center font-semibold text-purple-600 hover:text-purple-700 group-hover:translate-x-2 transition-all duration-300">
                  Manage Subjects 
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            </div>

            {/* Payments Management */}
            <div className="group relative bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl p-8 shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 hover:-translate-y-3 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-2xl mb-6 group-hover:rotate-3 transition-transform duration-300">
                  <CreditCard className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Payment Tracking</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Monitor fee payments, generate automated receipts, track financial records with secure processing and detailed reporting.
                </p>
                <Link href="/payments" className="inline-flex items-center font-semibold text-emerald-600 hover:text-emerald-700 group-hover:translate-x-2 transition-all duration-300">
                  Manage Payments 
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            </div>

            {/* Reports & Analytics */}
            <div className="group relative bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl p-8 shadow-2xl hover:shadow-amber-500/20 transition-all duration-500 hover:-translate-y-3 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-yellow-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-2xl mb-6 group-hover:rotate-3 transition-transform duration-300">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Reports & Analytics</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Generate comprehensive reports, gain insights into school performance with interactive charts and real-time analytics dashboard.
                </p>
                <Link href="/dashboard" className="inline-flex items-center font-semibold text-amber-600 hover:text-amber-700 group-hover:translate-x-2 transition-all duration-300">
                  View Dashboard 
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

