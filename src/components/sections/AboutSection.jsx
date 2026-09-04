import React from 'react';
import { motion } from 'framer-motion';
import { getDeveloperProfile } from '../../data';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { Brain, Network, Eye, ShieldCheck } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
};

export default function AboutSection() {
  const { language, t } = useLanguage();
  const profile = getDeveloperProfile(language);

  const pillars = [
    {
      icon: Brain,
      title: 'AI & NLP Research',
      desc: t('about.pillarAiDesc'),
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/15',
      border: 'border-indigo-500/30'
    },
    {
      icon: Network,
      title: 'Network & Systems',
      desc: t('about.pillarNetDesc'),
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/15',
      border: 'border-cyan-500/30'
    },
    {
      icon: Eye,
      title: 'Computer Vision',
      desc: t('about.pillarVisionDesc'),
      color: 'text-purple-400',
      bg: 'bg-purple-500/15',
      border: 'border-purple-500/30'
    },
    {
      icon: ShieldCheck,
      title: 'Full-Stack & Security',
      desc: t('about.pillarFullstackDesc'),
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/15',
      border: 'border-emerald-500/30'
    }
  ];

  return (
    <section id="about" className="relative px-4 sm:px-6 w-full max-w-7xl mx-auto pt-24">
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.2 }}
        variants={containerVariants}
        className="text-center space-y-4 mb-16"
      >
        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">{t('about.badge')}</span>
        </motion.div>
        
        <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white">
          {t('about.title')}
        </motion.h2>
        
        <motion.p variants={itemVariants} className="text-zinc-400 max-w-2xl mx-auto text-base sm:text-lg">
          {t('about.subtitle')}
        </motion.p>
      </motion.div>

      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.15 }}
        variants={containerVariants}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
      >
        {/* Main Bio Card */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-6 space-y-6 text-base sm:text-lg text-zinc-300 leading-relaxed p-8 sm:p-10 liquid-glass-strong liquid-glass-hover relative overflow-hidden flex flex-col justify-center"
        >
          <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <p className="relative z-10">
            {language === 'id' ? (
              <>
                Saya adalah seorang pengembang perangkat lunak dan mahasiswa <strong>{profile.degree}</strong> di <strong>{profile.institution}</strong> yang mendalami bidang <strong>Kecerdasan Buatan (NLP, Machine Learning, Computer Vision)</strong> serta <strong>Arsitektur Jaringan Komputer & Web Modern</strong>.
              </>
            ) : (
              <>
                I am a software developer and undergraduate student in <strong>{profile.degree}</strong> at <strong>{profile.institution}</strong>, specializing in <strong>Artificial Intelligence (NLP, Machine Learning, Computer Vision)</strong> as well as <strong>Computer Network Architecture & Modern Web Systems</strong>.
              </>
            )}
          </p>
          <p className="relative z-10">
            {language === 'id' ? (
              <>
                Melalui proyek riset seperti <strong>OpenPlagiarismChecker</strong>, saya mengembangkan alternatif mesin pemeriksa dokumen akademik yang menggabungkan pencocokan eksak <em>N-Gram Shingling</em> dan embedding semantik <em>Sentence Transformers</em> tanpa kompromi privasi data. Di bidang klasifikasi, saya merancang evaluasi model <em>Complement Naive Bayes vs XGBoost</em> serta metode <em>Domain Adaptation</em> untuk mengatasi <em>Concept Drift</em> pada email spam modern.
              </>
            ) : (
              <>
                Through research initiatives such as <strong>OpenPlagiarismChecker</strong>, I engineer privacy-preserving academic document similarity engines combining exact <em>N-Gram Shingling</em> with semantic <em>Sentence Transformers</em> embeddings. In machine learning classification, I designed comparative evaluations between <em>Complement Naive Bayes and XGBoost</em> alongside <em>Domain Adaptation</em> techniques to resolve <em>Concept Drift</em> in contemporary email datasets.
              </>
            )}
          </p>
        </motion.div>

        {/* Pillars Cards - Liquid Glass 2x2 Grid */}
        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pillars.map((pillar, i) => (
            <motion.div 
              key={i} 
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-6 liquid-glass liquid-glass-hover group cursor-default relative overflow-hidden flex flex-col justify-between"
            >
              <div className="relative z-10">
                <div className={`w-10 h-10 rounded-xl ${pillar.bg} border ${pillar.border} flex items-center justify-center ${pillar.color} mb-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]`}>
                  <pillar.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
