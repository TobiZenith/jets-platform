export default function Home() {
  return (
    <main className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-sm sticky top-0 z-50">
        <img src="/images/logo.jpeg" alt="JETS" className="h-14 w-auto" />
        <div className="hidden md:flex gap-8 text-gray-600 text-sm font-medium">
          <a href="#features" className="hover:text-blue-600 transition">Features</a>
          <a href="#portals" className="hover:text-blue-600 transition">Portals</a>
          <a href="#how-it-works" className="hover:text-blue-600 transition">How It Works</a>
          <a href="#contact" className="hover:text-blue-600 transition">Contact</a>
        </div>
        <div className="flex gap-3">
          <a href="/register" className="text-sm bg-yellow-500 text-white font-semibold px-4 py-2 rounded-full hover:bg-yellow-600 transition">
            Get Started
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-pink-50 to-yellow-50 py-28 px-8 text-center">
        <div className="inline-block bg-blue-100 text-blue-600 text-xs font-bold px-4 py-1 rounded-full mb-6 uppercase tracking-widest">
          School Management Made Simple
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
          Manage Your School <br />
          <span className="text-yellow-500">Smarter & Faster</span>
        </h1>
        <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto mb-10">
          JETS gives schools a complete platform to manage students, teachers, attendance, grades, fees and more — all in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/register" className="bg-yellow-500 text-white font-bold px-8 py-4 rounded-full hover:bg-yellow-600 transition text-lg shadow-lg">
            Register Your School
          </a>
          <a href="#portals" className="bg-white text-gray-700 font-bold px-8 py-4 rounded-full hover:bg-gray-50 transition text-lg border border-gray-200 shadow-sm">
            View Portals
          </a>
        </div>
      </section>

      {/* Portals Section */}
      <section id="portals" className="py-20 px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Choose Your Portal</h2>
            <p className="text-gray-500 text-lg">Every user has a dedicated portal built for their needs</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Admin Portal */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-3xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-md transition">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center text-3xl mb-4">&#127979;</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">School Admin</h3>
              <p className="text-gray-500 text-sm mb-6">Manage students, teachers, classes, grades, attendance, fees and more from one powerful dashboard.</p>
              <a href="/login" className="w-full bg-yellow-500 text-white font-bold py-3 rounded-xl hover:bg-yellow-600 transition text-sm">
                Admin Login
              </a>
              <a href="/register" className="mt-3 text-yellow-600 text-sm font-semibold hover:underline">
                Register your school
              </a>
            </div>

            {/* Teacher Portal */}
            <div className="bg-gradient-to-br from-green-50 to-teal-50 border border-green-200 rounded-3xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-md transition">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mb-4">&#128105;&#8205;&#127979;</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Teacher Portal</h3>
              <p className="text-gray-500 text-sm mb-6">View your class, mark attendance, manage student grades and add new students to your class.</p>
              <a href="/teacher/login" className="w-full bg-green-500 text-white font-bold py-3 rounded-xl hover:bg-green-600 transition text-sm">
                Teacher Login
              </a>
              <p className="mt-3 text-gray-400 text-xs">Login credentials provided by your school admin</p>
            </div>

            {/* Parent Portal */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-md transition">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl mb-4">&#128106;</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Parent Portal</h3>
              <p className="text-gray-500 text-sm mb-6">Stay updated on your child grades, attendance and school announcements from anywhere.</p>
              <a href="/parent/login" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition text-sm">
                Parent Login
              </a>
              <a href="/parent/register" className="mt-3 text-blue-600 text-sm font-semibold hover:underline">
                Register as parent
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-8 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-gray-500 text-lg">Built for modern schools of all sizes</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { icon: "&#127891;", title: "Student Management", desc: "Add, edit and track all students with photos and ID cards" },
              { icon: "&#128197;", title: "Attendance Tracking", desc: "Calendar-based attendance with bulk marking and history" },
              { icon: "&#128202;", title: "Grades & Reports", desc: "Record grades by subject and term, send to parents" },
              { icon: "&#128184;", title: "Fee Management", desc: "Track fee payments and outstanding balances" },
              { icon: "&#128203;", title: "Timetable", desc: "Set and manage class schedules for all classes" },
              { icon: "&#129338;", title: "ID Card Designer", desc: "Custom student ID cards with your school logo and colors" },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-gray-800 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">How It Works</h2>
          <p className="text-gray-500 text-lg mb-12">Get your school up and running in minutes</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Register Your School", desc: "Sign up and get a unique school code for your institution" },
              { step: "2", title: "Add Your Team", desc: "Add teachers, create classes and enroll students" },
              { step: "3", title: "Start Managing", desc: "Track attendance, grades, fees and communicate with parents" },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-12 h-12 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xl font-extrabold mb-4">{s.step}</div>
                <h3 className="font-bold text-gray-800 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 px-8 bg-yellow-50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-gray-500 text-lg mb-8">Join schools already using JETS to manage smarter</p>
          <a href="/register" className="bg-yellow-500 text-white font-bold px-10 py-4 rounded-full hover:bg-yellow-600 transition text-lg shadow-lg">
            Register Your School Free
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-8 text-center">
        <img src="/images/logo.jpeg" alt="JETS" className="h-10 w-auto mx-auto mb-4 opacity-80" />
        <p className="text-sm">© 2026 JETS Platform. All rights reserved.</p>
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <a href="/login" className="hover:text-white transition">Admin Login</a>
          <a href="/teacher/login" className="hover:text-white transition">Teacher Login</a>
          <a href="/parent/login" className="hover:text-white transition">Parent Login</a>
          <a href="/register" className="hover:text-white transition">Register</a>
        </div>
      </footer>
    </main>
  )
}
