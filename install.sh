#!/bin/bash

# ==============================================
# PalTattoo - Installation Script
# ==============================================

set -e  # Exit on any error

echo "🎨 PalTattoo Installation Script"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running on supported OS
check_os() {
    print_info "Checking operating system..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        print_status "Linux detected"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        print_status "macOS detected"
    else
        print_error "Unsupported operating system: $OSTYPE"
        exit 1
    fi
}

# Check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_status "Node.js found: $NODE_VERSION"
    else
        print_error "Node.js not found. Please install Node.js 18.x or higher"
        print_info "Visit: https://nodejs.org/"
        exit 1
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_status "npm found: $NPM_VERSION"
    else
        print_error "npm not found. Please install npm"
        exit 1
    fi
    
    # Check MySQL
    if command -v mysql &> /dev/null; then
        MYSQL_VERSION=$(mysql --version)
        print_status "MySQL found: $MYSQL_VERSION"
    else
        print_error "MySQL not found. Please install MySQL 8.x or higher"
        print_info "Visit: https://dev.mysql.com/downloads/"
        exit 1
    fi
    
    # Check Git
    if command -v git &> /dev/null; then
        GIT_VERSION=$(git --version)
        print_status "Git found: $GIT_VERSION"
    else
        print_error "Git not found. Please install Git"
        exit 1
    fi
}

# Setup environment files
setup_environment() {
    print_info "Setting up environment files..."
    
    # Backend environment
    if [ ! -f "backend/.env" ]; then
        cp backend/.env.example backend/.env
        print_status "Backend .env file created from example"
        print_warning "Please edit backend/.env with your configuration"
    else
        print_info "Backend .env file already exists"
    fi
    
    # Frontend environment
    if [ ! -f "frontend/.env" ]; then
        cp frontend/.env.example frontend/.env
        print_status "Frontend .env file created from example"
        print_warning "Please edit frontend/.env with your configuration"
    else
        print_info "Frontend .env file already exists"
    fi
}

# Setup database
setup_database() {
    print_info "Setting up database..."
    
    echo ""
    print_warning "Database setup requires MySQL root access"
    echo -n "Enter MySQL root password: "
    read -s MYSQL_ROOT_PASSWORD
    echo ""
    
    # Test MySQL connection
    if mysql -u root -p$MYSQL_ROOT_PASSWORD -e "SELECT 1;" &> /dev/null; then
        print_status "MySQL connection successful"
    else
        print_error "Failed to connect to MySQL with provided credentials"
        exit 1
    fi
    
    # Create database and import schema
    print_info "Creating database schema..."
    mysql -u root -p$MYSQL_ROOT_PASSWORD < database/setup.sql
    print_status "Database schema created"
    
    # Import sample data
    print_info "Importing sample data..."
    mysql -u root -p$MYSQL_ROOT_PASSWORD < database/seed_data.sql
    print_status "Sample data imported"
    
    print_status "Database setup completed"
    print_info "Test accounts created:"
    print_info "  Client: test@test.com / password123"
    print_info "  Artist: artist@test.com / password123"
}

# Install backend dependencies
install_backend() {
    print_info "Installing backend dependencies..."
    cd backend
    npm install
    print_status "Backend dependencies installed"
    cd ..
}

# Install frontend dependencies
install_frontend() {
    print_info "Installing frontend dependencies..."
    cd frontend
    npm install
    print_status "Frontend dependencies installed"
    cd ..
}

# Create uploads directory
setup_uploads() {
    print_info "Setting up uploads directory..."
    mkdir -p backend/uploads/avatars
    mkdir -p backend/uploads/portfolio
    mkdir -p backend/uploads/references
    mkdir -p backend/uploads/shops
    print_status "Uploads directories created"
}

# Main installation function
main() {
    echo "Starting PalTattoo installation..."
    echo ""
    
    check_os
    check_prerequisites
    setup_environment
    install_backend
    install_frontend
    setup_uploads
    
    echo ""
    print_info "Database setup (optional - you can do this manually later)"
    echo -n "Do you want to set up the database now? (y/N): "
    read -r SETUP_DB
    
    if [[ $SETUP_DB =~ ^[Yy]$ ]]; then
        setup_database
    else
        print_warning "Database setup skipped"
        print_info "To set up the database later, run:"
        print_info "  mysql -u root -p < database/setup.sql"
        print_info "  mysql -u root -p < database/seed_data.sql"
    fi
    
    echo ""
    print_status "🎉 Installation completed successfully!"
    echo ""
    print_info "Next steps:"
    print_info "1. Edit backend/.env with your configuration (database, email, etc.)"
    print_info "2. Edit frontend/.env with your configuration (API URLs, Google OAuth, etc.)"
    print_info "3. Start the development servers:"
    echo ""
    echo "  # Terminal 1 - Backend"
    echo "  cd backend && npm run dev"
    echo ""
    echo "  # Terminal 2 - Frontend"
    echo "  cd frontend && npm start"
    echo ""
    print_info "Application will be available at:"
    print_info "  Frontend: http://localhost:3000"
    print_info "  Backend:  http://localhost:5000"
    echo ""
    print_warning "Don't forget to configure:"
    print_info "  • MySQL database connection"
    print_info "  • Email service (Gmail recommended)"
    print_info "  • Google OAuth credentials"
    print_info "  • MercadoPago credentials (optional)"
    echo ""
}

# Run installation
main "$@"