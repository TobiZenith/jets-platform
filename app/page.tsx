export default function Home() {
  return (
    <main className="min-h-screen bg-white font-sans">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-sm sticky top-0 z-50">
       <img src="/images/logo.jpeg" alt="JETS" className="h-25 w-auto" />
        <div className="hidden md:flex gap-8 text-gray-600 text-sm font-medium">
          <a href="#features" className="hover:text-blue-600 transition">Features</a>
          <a href="#how-it-works" className="hover:text-blue-600 transition">How It Works</a>
          <a href="#pricing" className="hover:text-blue-600 transition">Pricing</a>
          <a href="#contact" className="hover:text-blue-600 transition">Contact</a>
        </div>
        <div className="flex gap-3">
          <a href="/login" className="text-sm text-blue-600 border border-blue-600 px-4 py-2 rounded-full hover:bg-blue-50 transition">
            Log In
          </a>
          <a href="/register" className="text-sm bg-blue-600 text-white font-semibold px-4 py-2 rounded-full hover:bg-blue-700 transition">
            Get Started
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-pink-50 to-yellow-50 py-28 px-8 text-center">
        <div className="inline-block bg-blue-100 text-blue-600 text-xs font-bold px-4 py-1 rounded-full mb-6 uppercase tracking-widest">
          School Management Made Simple
        </div>
        <h1 className="text-5xl font-extrabold text-gray-800 mb-6 leading-tight">
          The Smartest Way to <br />
          <span className="text-blue-600">Manage Your School</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-10">
          JETS brings students, teachers, parents and admins together on one friendly platform. Easy to use, powerful enough for any school.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <a href="/register" className="bg-blue-600 text-white font-bold px-8 py-3 rounded-full text-lg hover:bg-blue-700 transition shadow-lg">
            Register Your School 🚀
          </a>
          <a href="#features" className="border border-gray-300 text-gray-600 px-8 py-3 rounded-full text-lg hover:border-blue-600 hover:text-blue-600 transition">
            See Features
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-8 bg-white">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">Everything Your School Needs</h2>
        <p className="text-center text-gray-400 mb-12">Simple tools built for schools of all sizes</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { icon: "🎓", title: "Student Management", desc: "Easily add, manage and track all your students in one place.", color: "bg-blue-50 border-blue-200" },
            { icon: "👩‍🏫", title: "Teacher Profiles", desc: "Manage teacher information, subjects and class assignments.", color: "bg-pink-50 border-pink-200" },
            { icon: "📊", title: "Grades & Reports", desc: "Record and share grades and report cards with ease.", color: "bg-yellow-50 border-yellow-200" },
            { icon: "📅", title: "Attendance Tracking", desc: "Mark and monitor attendance for every class, every day.", color: "bg-green-50 border-green-200" },
            { icon: "📢", title: "Announcements", desc: "Send school-wide or class-specific announcements instantly.", color: "bg-purple-50 border-purple-200" },
            { icon: "👨‍👩‍👧", title: "Parent Portal", desc: "Keep parents informed about their child's progress anytime.", color: "bg-orange-50 border-orange-200" },
          ].map((feature, i) => (
            <div key={i} className={`${feature.color} border rounded-2xl p-6 hover:shadow-md transition text-center`}>
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-500 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-8 bg-gradient-to-br from-blue-50 to-pink-50">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">How It Works</h2>
        <p className="text-center text-gray-400 mb-12">Get your school up and running in minutes</p>
        <div className="flex flex-col md:flex-row justify-center gap-8 max-w-4xl mx-auto">
          {[
            { step: "1", title: "Register Your School", desc: "Sign up and create your school's profile on JETS.", color: "bg-blue-600" },
            { step: "2", title: "Add Teachers & Students", desc: "Import or manually add your staff and students.", color: "bg-pink-500" },
            { step: "3", title: "Start Managing", desc: "Use your dashboard to manage everything from day one.", color: "bg-green-500" },
          ].map((item, i) => (
            <div key={i} className="text-center flex-1 bg-white rounded-2xl p-8 shadow-sm">
              <div className={`w-14 h-14 ${item.color} text-white font-extrabold text-xl rounded-full flex items-center justify-center mx-auto mb-4`}>
                {item.step}
              </div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-pink-500 text-white py-20 px-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Transform Your School? 🎉</h2>
        <p className="text-blue-100 mb-8 text-lg">Join hundreds of schools already using JETS to simplify their management.</p>
        <a href="/register" className="bg-white text-blue-600 font-bold px-10 py-4 rounded-full text-lg hover:bg-blue-50 transition shadow-lg">
          Register Your School Today
        </a>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 text-gray-400 text-center py-6 text-sm border-t border-gray-200">
        © 2026 JETS. All rights reserved. Built with ❤️ for schools everywhere.
      </footer>

    </main>
  )
}