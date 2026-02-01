'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, ChevronDown, Plus, Minus } from 'lucide-react'
import { Artisan } from './types'

interface ArtisanFAQProps {
  artisan: Artisan
}

export function ArtisanFAQ({ artisan }: ArtisanFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  if (!artisan.faq || artisan.faq.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
    >
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <HelpCircle className="w-5 h-5 text-blue-600" />
        Questions frequentes
      </h2>

      <div className="space-y-3">
        {artisan.faq.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            className="border border-gray-100 rounded-xl overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full px-5 py-4 flex items-center justify-between text-left bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="font-medium text-gray-900 pr-4">{item.question}</span>
              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${openIndex === index ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                {openIndex === index ? (
                  <Minus className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </div>
            </button>

            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 py-4 bg-white text-gray-600 leading-relaxed">
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
