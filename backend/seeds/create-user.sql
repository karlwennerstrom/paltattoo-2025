-- Create a new MySQL user for the application
CREATE USER IF NOT EXISTS 'tattooconnect'@'localhost' IDENTIFIED BY 'Dracula241988.';
GRANT ALL PRIVILEGES ON tattoo_connect.* TO 'tattooconnect'@'localhost';
FLUSH PRIVILEGES;