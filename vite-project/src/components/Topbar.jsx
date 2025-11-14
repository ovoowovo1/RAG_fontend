import React from 'react'
import LanguageSwitcher from './LanguageSwitcher'

export default function Topbar() {
  return (
    <div className="w-full bg-white border-b border-gray-200 px-4 py-3 flex justify-end items-center">
      <LanguageSwitcher />
    </div>
  )
}
