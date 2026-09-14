import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Haven — Find your place',description:'Discover homes for sale and rent. Find your next chapter with Haven.',icons:{icon:'/favicon.svg'}};
export default function Layout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}
