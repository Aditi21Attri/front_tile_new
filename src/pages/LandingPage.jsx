import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Target, CheckCircle } from 'lucide-react';
import netsmartsLogo from '../assets/netsmartz_logo.jpg';



const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function LandingPage({ onStartSearch }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white text-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-orange-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={netsmartsLogo} alt="Netsmarts Logo" className="h-10 w-auto" />
            {/* <img src="../assets/netsmartz_logo.jpg" alt="Netsmartz Logo" className="h-10 w-auto" /> */}
          </div>
          <div className="flex items-center gap-4">
            <a href="#features" className="text-sm text-slate-600 hover:text-brand-orange transition-colors">Features</a>
            <a href="#workflow" className="text-sm text-slate-600 hover:text-brand-orange transition-colors">How It Works</a>
            <div className="flex gap-2">
              <button
                onClick={() => onStartSearch()}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-brand-orange to-brand-orange-light text-white font-semibold text-sm hover:shadow-glow-orange transition-all duration-300 hover:-translate-y-0.5"
              >
                Start Search
              </button>
              <button
                onClick={() => window.location.href = '/admin'}
                className="px-6 py-2 rounded-xl border-2 border-brand-orange text-brand-orange font-semibold text-sm hover:bg-brand-orange hover:text-white transition-all duration-300"
              >
                Admin Panel
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative max-w-6xl mx-auto px-6 py-20 md:py-32">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 text-center">
          {/* Badge */}
          <motion.div variants={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-orange/30 bg-brand-orange/10 mx-auto">
            <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
            <span className="text-sm text-brand-orange font-semibold">Enterprise-Grade AI</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1 variants={item} className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-slate-900">
            Intelligent Tile
            <br />
            <span className="bg-gradient-to-r from-brand-orange via-brand-orange-light to-brand-indigo bg-clip-text text-transparent">
              Detection & Recommendation
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p variants={item} className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
            Advanced AI-powered tile recognition system using YOLOv8 and semantic search to find perfect tile matches instantly.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={item} className="flex flex-wrap gap-4 justify-center pt-4">
            <button
              onClick={onStartSearch}
              className="flex items-center gap-2 px-10 py-4 rounded-xl bg-gradient-to-r from-brand-orange to-brand-orange-light text-white font-semibold text-lg hover:shadow-glow-orange transition-all duration-300 hover:-translate-y-1"
            >
              <Sparkles size={20} />
              Start Searching
              <ArrowRight size={18} />
            </button>
          </motion.div>
        </motion.div>

        {/* Animated background elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-brand-orange/5 rounded-full blur-3xl opacity-40" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-brand-indigo/5 rounded-full blur-3xl opacity-40" />
      </section>

      {/* Features Section */}
      <section id="features" className="relative max-w-6xl mx-auto px-6 py-20">
        <motion.div variants={container} initial="hidden" whileInView="show" className="space-y-12">
          <motion.div variants={item} className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900">Powerful Features</h2>
            <p className="text-lg text-slate-600">Everything you need for professional tile detection and matching</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Target, title: 'Detection', desc: 'Accurately detect tiles in images using YOLOv8' },
              { icon: Sparkles, title: 'Semantic Search', desc: 'AI-powered similarity matching with 2048-D embeddings' },
              { icon: Zap, title: 'Lightning Fast', desc: 'Real-time results with optimized FAISS indexing' },
              { icon: CheckCircle, title: 'Accurate Matching', desc: 'Advanced ResNet50 embeddings with rotation TTA' },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  variants={item}
                  className="p-6 rounded-xl border border-orange-200 bg-white hover:bg-slate-50 hover:border-brand-orange/50 transition-all duration-300 group shadow-sm hover:shadow-md"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-brand-orange to-brand-orange-light flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-600">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="relative max-w-6xl mx-auto px-6 py-20">
        <motion.div variants={container} initial="hidden" whileInView="show" className="space-y-12">
          <motion.div variants={item} className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900">Simple Workflow</h2>
            <p className="text-lg text-slate-600">Three steps to find perfect tile matches</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: '01', title: 'Upload Image', desc: 'Upload a photo of tiles you want to match' },
              { num: '02', title: 'Detect Tiles', desc: 'AI automatically detects individual tiles in the image' },
              { num: '03', title: 'Find Matches', desc: 'Get similar tiles from your catalogue with scores' },
            ].map((step, idx) => (
              <motion.div key={idx} variants={item} className="relative">
                <div className="p-8 rounded-xl border border-orange-200 bg-white text-center shadow-sm hover:shadow-md transition-all">
                  <div className="text-5xl font-bold text-transparent bg-gradient-to-r from-brand-orange to-brand-indigo bg-clip-text mb-4">
                    {step.num}
                  </div>
                  <h3 className="font-bold text-xl text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-slate-600">{step.desc}</p>
                </div>
                {idx < 2 && (
                  <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight size={24} className="text-brand-orange" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="relative max-w-6xl mx-auto px-6 py-20">
        <motion.div variants={container} initial="hidden" whileInView="show" className="grid md:grid-cols-3 gap-8">
          {[
            { value: '1000+', label: 'Tiles Indexed' },
            { value: '98%', label: 'Matching Accuracy' },
            { value: '<200ms', label: 'Average Response' },
          ].map((stat, idx) => (
            <motion.div key={idx} variants={item} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-transparent bg-gradient-to-r from-brand-orange to-brand-indigo bg-clip-text mb-2">
                {stat.value}
              </div>
              <p className="text-slate-400">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="relative max-w-4xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="p-12 rounded-2xl border border-brand-orange/30 bg-gradient-to-r from-brand-orange/5 to-brand-indigo/5 text-center space-y-6"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Ready to Find Perfect Tiles?</h2>
          <p className="text-lg text-slate-600 max-w-xl mx-auto">
            Start searching now and discover the power of AI-driven tile matching
          </p>
          <button
            onClick={onStartSearch}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-orange to-brand-orange-light text-white font-semibold mx-auto hover:shadow-glow-orange transition-all duration-300 hover:-translate-y-1"
          >
            <Sparkles size={20} />
            Get Started Now
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-orange-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={20} className="text-brand-orange" />
                <span className="font-bold text-slate-900">TileDetect AI</span>
              </div>
              <p className="text-sm text-slate-600">Enterprise-grade tile detection and recommendation system</p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm text-slate-900">Product</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-brand-orange transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-brand-orange transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-brand-orange transition-colors">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm text-slate-900">Company</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-brand-orange transition-colors">About</a></li>
                <li><a href="#" className="hover:text-brand-orange transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-brand-orange transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm text-slate-900">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-brand-orange transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-brand-orange transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-brand-orange transition-colors">GitHub</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-orange-100 pt-8 text-center text-sm text-slate-600">
            <p>© 2024 Netsmartz TileDetect AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
