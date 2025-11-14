import Image from 'next/image'
import logo from '../../../public/logo.png'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-4 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center font-montserrat">
          <div>
            <h3 className="text-base font-bold mb-2">
              School Management System
            </h3>
            <Image
              src={logo}
              alt="School Management System Logo"
              width={100}
              height={100}
              className="mx-auto"
            />
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
          <div>
            <h6 className="font-semibold mb-2">Contact</h6>
            <p className="text-sm">schoolmanagementad@gmail.com</p>
            <p className="text-sm">0123456789</p>
          </div>
        </div>
        <hr className="my-4 opacity-25" />
        <div className="text-center text-sm font-montserrat">
          <p>&copy;2025 School Management System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
