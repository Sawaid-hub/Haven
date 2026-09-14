import ListingForm from '../listing-form';
import {requireChatGPTUser} from '../chatgpt-auth';
export const dynamic='force-dynamic';
export default async function Page(){await requireChatGPTUser('/list');return <ListingForm/>}
