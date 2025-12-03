import Image from 'next/image'
import logo from '../../../public/logo.png'
import Link from 'next/link'
import { MdEmail, MdPhone } from 'react-icons/md'

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground pt-4 mt-top relative">
      <Image
        src={logo}
        alt="School Management System Logo"
        width={150}
        height={150}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 select-none pointer-events-none"
      />
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left font-montserrat">
          <div>
            <h3 className="text-base font-bold mb-2">
              School Management System
            </h3>
          </div>
          <div>
            <h6 className="font-semibold mb-2">Quick Links</h6>
            <div className="space-y-1 text-sm">
              <Link
                href="https://github.com/ITITIU21299/SchoolManagement"
                target="_blank"
                className="block hover:underline"
              >
                About
              </Link>
              <Link
                href="/privacy"
                target="_blank"
                className="block hover:underline"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                target="_blank"
                className="block hover:underline"
              >
                Terms
              </Link>
            </div>
          </div>
          <div className="">
            <h6 className="font-semibold mb-2">Contact</h6>
            <div className="flex items-center space-x-2">
              <span>
                <MdEmail />
              </span>
              <p className="text-sm">schoolmanagementad@gmail.com</p>
            </div>
            <div className="flex items-center space-x-2">
              <span>
                <MdPhone />
              </span>
              <p className="text-sm">0123456789</p>
            </div>
          </div>
        </div>
        <hr className="mt-4 mb-2 opacity-25" />
        <div className="mb-2 text-center text-sm font-montserrat">
          <p>&copy;2025 School Management System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
