export default function Footer() {
  return (
    <footer className="w-full bg-gray-100 border-t border-gray-200 py-6 md:py-8">
      {/* Only the bottom copyright section */}
      <div className="text-center text-gray-500">
        <p className="text-xs sm:text-sm">&copy; {new Date().getFullYear()} Tenza. All rights reserved.</p>
      </div>
    </footer>
  );
}
