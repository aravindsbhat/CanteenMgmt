-- Canteen Management System Database Schema

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menu items table
CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    available INTEGER DEFAULT 0,
    image VARCHAR(500),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    total DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table (for order details)
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id INTEGER REFERENCES menu_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_menu_items_category ON menu_items(category);

-- Insert default admin and customer users
INSERT INTO users (email, password, name, role) VALUES 
('admin@canteen.com', '$2a$10$kStC1DLmns/Y.HYZi6mL/.APust2q3o6njMNh7Uxa6eMWnJEDDVzW', 'Admin User', 'admin'),
('customer@example.com', '$2a$10$CQOJP6d4DDVI8DGkze/aQOFdyMCZDaLeq158E3c5aeg6cgwsRg97G', 'John Doe', 'customer');

-- Insert sample menu items
INSERT INTO menu_items (name, price, category, available, image, description) VALUES 
('Veg Thali', 120.00, 'Main Course', 25, 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&h=200&fit=crop', 'Complete vegetarian meal with rice, dal, vegetables, roti, and dessert'),
('Chicken Biryani', 180.00, 'Main Course', 15, 'https://images.unsplash.com/photo-1563379091339-03246963d51a?w=300&h=200&fit=crop', 'Aromatic basmati rice cooked with tender chicken and spices'),
('Masala Dosa', 80.00, 'South Indian', 30, 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=300&h=200&fit=crop', 'Crispy rice and lentil crepe filled with spiced potato curry'),
('Paneer Butter Masala', 150.00, 'Main Course', 20, 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=300&h=200&fit=crop', 'Rich and creamy paneer curry in tomato-based sauce'),
('Samosa (2 pcs)', 40.00, 'Snacks', 50, 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd9?w=300&h=200&fit=crop', 'Crispy pastry filled with spiced potatoes and peas'),
('Mango Lassi', 60.00, 'Beverages', 40, 'https://images.unsplash.com/photo-1570831739435-6601aa3fa4fb?w=300&h=200&fit=crop', 'Refreshing yogurt-based drink with fresh mango'),
('Chole Bhature', 110.00, 'North Indian', 18, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop', 'Spicy chickpea curry served with fluffy fried bread'),
('Filter Coffee', 25.00, 'Beverages', 60, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&h=200&fit=crop', 'South Indian style filtered coffee with perfect blend');
