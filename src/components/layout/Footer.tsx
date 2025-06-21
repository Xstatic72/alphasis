export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-6 py-8">
        <div className="text-center">
          <div className="mb-4">
            <h3 className="text-xl font-bold bg-gradient-to-r from-aerospace-orange to-gamboge bg-clip-text text-transparent">
              AlphaSIS
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              Modern School Information System
            </p>
          </div>
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Alpha Beta Secondary School. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
