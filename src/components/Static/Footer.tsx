import Link from "next/link";
 
 export default function Footer() {
   return (
     <footer className="py-6 border-t border-github-border mt-12 text-center text-github-text-secondary">
       <div className="px-4 md:px-6 lg:px-8 w-full">
         <div className="flex flex-col md:flex-row justify-between items-center gap-4">
           <p className="text-sm sm:text-base">© {new Date().getFullYear()} Toxic Development - All Rights Reserved.</p>
           <ul className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
             <li>
               <Link href="/about" className="text-sm sm:text-base hover:text-github-text transition-colors">
                 About
               </Link>
             </li>
             <li>
               <Link href="/privacy" className="text-sm sm:text-base hover:text-github-text transition-colors">
                 Privacy
               </Link>
             </li>
             <li>
               <Link href="/terms" className="text-sm sm:text-base hover:text-github-text transition-colors">
                 Terms
               </Link>
             </li>
           </ul>
         </div>
       </div>
     </footer>
   );
 }