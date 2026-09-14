import ListingForm from '../listing-form';
import {getUser} from '../firebase-auth';
import {redirect} from 'next/navigation';
export const dynamic='force-dynamic';
export default async function Page(){if(!await getUser())redirect('/signin?return_to=%2Flist');return <ListingForm/>}
