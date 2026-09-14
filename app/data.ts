export type Property={id:string;title:string;mode:'Buy'|'Rent';type:string;price:number;beds:number;baths:number;area:number;city:string;state:string;address:string;zip:string;description:string;photos:string[];amenities:string[];contact:string;email:string;phone:string;role:string;featured?:boolean;demo?:boolean};
const photo=(id:number)=>`https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1200`;
const rows=[
['palm-residence','The Palm Residence','Buy','House',685000,4,3,2450,'Austin','Texas','1428 Willow Creek Lane','78704',7587878],
['brooklyn-light','Light-filled Brooklyn retreat','Buy','Apartment',540000,2,2,1250,'Brooklyn','New York','215 Bedford Avenue','11211',7214166],
['coastal-villa','The coastal hideaway','Buy','Villa',1295000,4,3,3100,'San Diego','California','840 Ocean View Drive','92037',29702291],
['oak-house','A fresh start on Oak Street','Buy','House',425000,3,2,1850,'Raleigh','North Carolina','306 Oak Street','27601',4529496],
['garden-townhouse','The garden townhouse','Buy','Townhouse',735000,3,2,1920,'Denver','Colorado','620 Grove Lane','80206',8134745],
['city-sanctuary','Your city sanctuary','Buy','Apartment',465000,2,2,1180,'Chicago','Illinois','1820 North Park Avenue','60614',7147291],
['rent-loft','Sunlit loft in the city','Rent','Apartment',2650,2,2,1250,'Austin','Texas','408 East 6th Street','78701',7147291],
['rent-pool','A home with room to unwind','Rent','House',4200,4,3,2450,'Austin','Texas','782 Barton Hills Drive','78704',8134745],
['rent-coast','Ocean evenings villa','Rent','Villa',6800,3,3,2700,'San Diego','California','192 Coast Boulevard','92037',28054848],
['rent-brooklyn','A quiet corner of Brooklyn','Rent','Apartment',3200,2,1,1050,'Brooklyn','New York','71 Grand Street','11249',7214166],
['rent-raleigh','The welcoming porch','Rent','House',2100,3,2,1850,'Raleigh','North Carolina','510 Maple Avenue','27601',4529496],
['rent-denver','Green space, city life','Rent','Townhouse',2900,3,2,1720,'Denver','Colorado','425 Elm Lane','80206',7587878]
];
export const properties:Property[]=rows.map((r,i)=>({id:String(r[0]),title:String(r[1]),mode:r[2] as 'Buy'|'Rent',type:String(r[3]),price:Number(r[4]),beds:Number(r[5]),baths:Number(r[6]),area:Number(r[7]),city:String(r[8]),state:String(r[9]),address:String(r[10]),zip:String(r[11]),photos:[...new Set([photo(Number(r[12])),photo(7214166),photo(7147291)])],description:`Welcome to ${r[1]}. Generous natural light and a thoughtfully arranged floor plan make this ${String(r[3]).toLowerCase()} feel instantly welcoming. Enjoy spacious living areas, a well-appointed kitchen, and comfortable bedrooms with room to make your own. Located in ${r[8]}, with neighborhood cafés, parks, and everyday essentials nearby.\n\nThis is an illustrative listing with stock photography, fictional contact details, and sample pricing. It is not an actual property offer.`,amenities:i%3===0?['Private garden','Parking','Air conditioning','Laundry']:['Air conditioning','Modern kitchen','Laundry','Storage'],contact:['Alex Morgan','Sophie Chen','Jordan Ellis'][i%3],email:'hello@example.com',phone:'+1 202-555-0147',role:'Agent',featured:i<3||i===6,demo:true}));
export const money=(p:Property)=>'$'+p.price.toLocaleString('en-US');
