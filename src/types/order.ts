export interface MenuItem {
  id: string
  cook_id: string
  name: string
  description: string
  price: number
  image_url: string | null
  category: 'appetizer' | 'main' | 'dessert' | 'drink' | 'side'
  prep_time_minutes: number
  serves: number
  available: boolean
}

export interface Order {
  id: string
  customer_id: string
  cook_id: string
  items: OrderItem[]
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  total: number
  delivery_address: string
  notes: string
  created_at: string
}

export interface OrderItem {
  menu_item_id: string
  quantity: number
  price: number
}
