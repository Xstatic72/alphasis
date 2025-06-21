"use client";

import { motion } from "framer-motion";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Users, GraduationCap, BookOpen, CreditCard, TrendingUp } from "lucide-react";

interface Payment {
  TransactionID: string;
  Amount: number;
  PaymentDate: Date;
  Term: string;
  Student: {
    FirstName: string;
    LastName: string;
  };
}

interface ClassWithCount {
  ClassName: string;
  _count: {
    Student: number;
  };
}

interface DashboardPageProps {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalSubjects: number;
  totalPayments: number;
  recentPayments: Payment[];
  studentsPerClass: ClassWithCount[];
}

export default function DashboardPageClient({
  totalStudents,
  totalTeachers,
  totalClasses,
  totalSubjects,
  totalPayments,
  recentPayments,
  studentsPerClass,
}: DashboardPageProps) {  // Prepare chart data
  const classData = studentsPerClass.map(cls => ({
    name: cls.ClassName,
    students: cls._count.Student,
  }));

  const statsData = [
    { name: 'Students', value: totalStudents, color: '#ff4e00' },
    { name: 'Teachers', value: totalTeachers, color: '#8ea604' },
    { name: 'Classes', value: totalClasses, color: '#f5bb00' },
    { name: 'Subjects', value: totalSubjects, color: '#ec9f05' },
  ];

  const statCards = [
    {
      title: "Total Students",
      value: totalStudents,
      icon: Users,
      color: "from-[#ff4e00] to-[#ff7033]",
      bgColor: "bg-gradient-to-br from-[#ff4e00]/10 to-[#ff7033]/5",
      textColor: "text-[#ff4e00]",
    },
    {
      title: "Total Teachers",
      value: totalTeachers,
      icon: GraduationCap,
      color: "from-[#8ea604] to-[#c5e706]",
      bgColor: "bg-gradient-to-br from-[#8ea604]/10 to-[#c5e706]/5",
      textColor: "text-[#8ea604]",
    },
    {
      title: "Total Classes",
      value: totalClasses,
      icon: BookOpen,
      color: "from-[#f5bb00] to-[#ffcd2b]",
      bgColor: "bg-gradient-to-br from-[#f5bb00]/10 to-[#ffcd2b]/5",
      textColor: "text-[#f5bb00]",
    },
    {
      title: "Total Payments",
      value: totalPayments,
      icon: CreditCard,
      color: "from-[#ec9f05] to-[#fbb52b]",
      bgColor: "bg-gradient-to-br from-[#ec9f05]/10 to-[#fbb52b]/5",
      textColor: "text-[#ec9f05]",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto py-10 px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold gradient-text mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome to your school management system</p>
        </motion.div>
        
        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {statCards.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <motion.div
                key={stat.title}
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className={`${stat.bgColor} p-6 rounded-xl border border-white/20 shadow-lg hover-lift backdrop-blur-sm relative overflow-hidden group`}
              >
                {/* Background gradient effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <TrendingUp className="h-4 w-4 text-gray-400" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
                  <motion.p
                    className={`text-3xl font-bold ${stat.textColor}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.3, type: "spring", stiffness: 200 }}
                  >
                    {stat.value}
                  </motion.p>
                </div>
                
                {/* Floating animation elements */}
                <motion.div
                  className="absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-r from-white/10 to-white/5 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
            );
          })}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Students per Class Chart */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
            className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-lg hover-lift"
          >
            <div className="flex items-center mb-6">
              <div className="p-2 rounded-lg bg-gradient-to-r from-[#ff4e00] to-[#8ea604] mr-3">
                <BarChart className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Students per Class</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={classData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="students" 
                  fill="url(#colorGradient)" 
                  radius={[4, 4, 0, 0]}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff4e00" />
                    <stop offset="100%" stopColor="#8ea604" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Overview Pie Chart */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.5 }}
            className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-lg hover-lift"
          >
            <div className="flex items-center mb-6">
              <div className="p-2 rounded-lg bg-gradient-to-r from-[#f5bb00] to-[#ec9f05] mr-3">
                <PieChart className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">School Overview</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Recent Payments */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.6 }}
          className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-lg hover-lift"
        >
          <div className="flex items-center mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-r from-[#ec9f05] to-[#f5bb00] mr-3">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Recent Payments</h2>
          </div>
          {recentPayments.length > 0 ? (            <div className="space-y-4">
              {recentPayments.map((payment: Payment, index: number) => (
                <motion.div
                  key={payment.TransactionID}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 hover-lift group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#ff4e00] to-[#8ea604] rounded-full flex items-center justify-center">                      <span className="text-white font-semibold text-sm">
                        {payment.Student?.FirstName?.[0]}{payment.Student?.LastName?.[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {payment.Student?.FirstName} {payment.Student?.LastName}
                      </p>
                      <p className="text-sm text-gray-600">{payment.Term}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg text-[#8ea604]">${payment.Amount.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">
                      {payment.PaymentDate ? new Date(payment.PaymentDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center py-8"
            >
              <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No recent payments</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}