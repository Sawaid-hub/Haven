import {Header,Footer} from './marketplace';
import {MapPin} from 'lucide-react';
export default function NotFound(){return <><Header/><main className="error-page"><div className="error-icon"><MapPin size={38}/></div><p className="eyebrow">404 · A LITTLE OFF THE MAP</p><h1>Let’s find your way home.</h1><p>This page may have moved, or this property is no longer available.</p><div className="error-actions"><a className="primary" href="/">Explore homes</a><a className="outline" href="/saved">Your saved homes</a></div></main><Footer/></>}
