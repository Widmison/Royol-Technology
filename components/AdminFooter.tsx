export default function AdminFooter() {
  return (
    <footer className="bg-mex-dark border-t border-gray-800 text-gray-500 py-4 mt-auto z-10 relative">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center text-xs font-medium">
        <div>&copy; {new Date().getFullYear()} MEX509 Logistics Server. Restricted Access.</div>
        <div className="mt-2 sm:mt-0 flex gap-4">
            <span>System Version 1.0.4</span>
            <span className="text-green-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Server Online</span>
        </div>
      </div>
    </footer>
  );
}