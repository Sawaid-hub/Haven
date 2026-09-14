'use client';
import {Header,Footer} from './marketplace';
import {House} from 'lucide-react';
export default function ErrorPage({reset}:{error:Error & {digest?:string};reset:()=>void}){return <><Header/><main className="error-page"><div className="error-icon"><House size={38}/></div><p className="eyebrow">A BRIEF DETOUR</p><h1>We couldn’t open this page.</h1><p>Something went wrong while loading. Please try again in a moment.</p><div className="error-actions"><button className="primary" onClick={reset}>Try again</button><a className="outline" href="/">Back to homes</a></div></main><Footer/></>}
