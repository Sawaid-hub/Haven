import Marketplace from '../../marketplace';
import {notFound} from 'next/navigation';
import {properties} from '../../data';
import {database} from '../../../db/store';
export const dynamic='force-dynamic';
export default async function Page({params}:{params:Promise<{id:string}>}){const{id}=await params;if(!properties.some(p=>p.id===id)){if(!/^[a-f0-9-]{36}$/.test(id))notFound();const row=await database().prepare('SELECT id FROM listings WHERE id = ?').bind(id).first();if(!row)notFound();}return <Marketplace propertyId={id}/>}
