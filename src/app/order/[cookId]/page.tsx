import { notFound } from 'next/navigation';
import type { Cook } from '@/types/cook';
import type { MenuItem } from '@/types/order';
import OrderPageClient from './OrderPageClient';

// Mock cook data
const MOCK_COOKS: Record<string, Cook> = {
  'sarah-johnson': {
    id: 'sarah-johnson',
    name: 'Sarah Johnson',
    bio: 'Persian cuisine enthusiast with 10 years of experience cooking traditional dishes passed down through generations.',
    avatar_url: null,
    specialties: ['Ghormeh Sabzi', 'Tahdig', 'Khoresh', 'Persian Rice'],
    location: 'Los Angeles, CA',
    rating: 4.9,
    review_count: 127,
    verified: true,
    created_at: '2023-01-15T00:00:00Z',
  },
  'ali-rezaei': {
    id: 'ali-rezaei',
    name: 'Ali Rezaei',
    bio: 'Third-generation chef from Tehran, bringing authentic Persian flavors to your table.',
    avatar_url: null,
    specialties: ['Kebab', 'Barbari Bread', 'Baklava', 'Persian Sweets'],
    location: 'Irvine, CA',
    rating: 4.8,
    review_count: 89,
    verified: true,
    created_at: '2023-03-20T00:00:00Z',
  },
};

// Mock menu items
const MOCK_MENU_ITEMS: Record<string, MenuItem[]> = {
  'sarah-johnson': [
    {
      id: '1',
      cook_id: 'sarah-johnson',
      name: 'Ghormeh Sabzi',
      description: 'Traditional Persian herb stew with beef, kidney beans, and dried limes. Served with basmati rice.',
      price: 18.99,
      image_url: null,
      category: 'main',
      prep_time_minutes: 45,
      serves: 2,
      available: true,
    },
    {
      id: '2',
      cook_id: 'sarah-johnson',
      name: 'Tahdig',
      description: 'Crispy golden rice from the bottom of the pot. A Persian delicacy!',
      price: 8.99,
      image_url: null,
      category: 'side',
      prep_time_minutes: 30,
      serves: 2,
      available: true,
    },
    {
      id: '3',
      cook_id: 'sarah-johnson',
      name: 'Kashk-e Bademjan',
      description: 'Creamy eggplant dip with caramelized onions, garlic, and whey.',
      price: 12.99,
      image_url: null,
      category: 'appetizer',
      prep_time_minutes: 25,
      serves: 2,
      available: true,
    },
    {
      id: '4',
      cook_id: 'sarah-johnson',
      name: 'Baklava',
      description: 'Sweet pastry made of layers of filo filled with chopped nuts and sweetened with syrup.',
      price: 6.99,
      image_url: null,
      category: 'dessert',
      prep_time_minutes: 15,
      serves: 1,
      available: true,
    },
    {
      id: '5',
      cook_id: 'sarah-johnson',
      name: 'Doogh',
      description: 'Refreshing Persian yogurt drink with mint and cucumber.',
      price: 3.99,
      image_url: null,
      category: 'drink',
      prep_time_minutes: 5,
      serves: 1,
      available: true,
    },
  ],
  'ali-rezaei': [
    {
      id: '6',
      cook_id: 'ali-rezaei',
      name: 'Koobideh Kebab',
      description: 'Grilled ground beef skewers seasoned with onions and spices. Served with grilled tomatoes and rice.',
      price: 21.99,
      image_url: null,
      category: 'main',
      prep_time_minutes: 35,
      serves: 2,
      available: true,
    },
    {
      id: '7',
      cook_id: 'ali-rezaei',
      name: 'Joojeh Kebab',
      description: 'Grilled marinated chicken skewers with saffron and lemon.',
      price: 19.99,
      image_url: null,
      category: 'main',
      prep_time_minutes: 35,
      serves: 2,
      available: true,
    },
    {
      id: '8',
      cook_id: 'ali-rezaei',
      name: 'Barbari Bread',
      description: 'Freshly baked Persian flatbread topped with sesame seeds.',
      price: 5.99,
      image_url: null,
      category: 'side',
      prep_time_minutes: 20,
      serves: 4,
      available: true,
    },
    {
      id: '9',
      cook_id: 'ali-rezaei',
      name: 'Zereshk Polo',
      description: 'Barberry rice with saffron and tender chicken.',
      price: 20.99,
      image_url: null,
      category: 'main',
      prep_time_minutes: 40,
      serves: 2,
      available: true,
    },
  ],
};

interface OrderPageProps {
  params: Promise<{ cookId: string }>;
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { cookId } = await params;
  const cook = MOCK_COOKS[cookId];

  if (!cook) {
    notFound();
  }

  const menuItems = MOCK_MENU_ITEMS[cookId] || [];

  return <OrderPageClient cook={cook} menuItems={menuItems} />;
}
