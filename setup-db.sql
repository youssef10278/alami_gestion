-- Script de création de la base de données Alami
-- Exécuter avec : psql -U postgres -f setup-db.sql

-- Créer la base de données
CREATE DATABASE alami_db;

-- Créer un utilisateur dédié (optionnel mais recommandé)
CREATE USER alami_user WITH PASSWORD 'alami_password_2024';

-- Donner tous les privilèges sur la base de données
GRANT ALL PRIVILEGES ON DATABASE alami_db TO alami_user;

-- Se connecter à la base de données
\c alami_db

-- Donner les privilèges sur le schéma public
GRANT ALL ON SCHEMA public TO alami_user;

