-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 15, 2026 at 08:42 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `prime_properties`
--

-- --------------------------------------------------------

--
-- Table structure for table `inquiries`
--

CREATE TABLE `inquiries` (
  `id` int(11) NOT NULL,
  `interest_type` varchar(20) DEFAULT NULL,
  `fullname` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `contact_methods` varchar(100) DEFAULT NULL,
  `preferred_datetime` datetime DEFAULT NULL,
  `message` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `property_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inquiries`
--

INSERT INTO `inquiries` (`id`, `interest_type`, `fullname`, `email`, `phone`, `contact_methods`, `preferred_datetime`, `message`, `created_at`, `property_id`) VALUES
(1, 'buy', 'Abdullah', 'abdullaee77@gmail.com', '03411743714', 'phone', '2026-02-14 13:19:00', 'nothing', '2026-02-14 08:19:50', 0),
(2, 'rent', 'fvfejrrb', 'd3yvyevubebe@gmail.com', 'ejbjrbu3', '', '2026-02-05 12:40:00', 'dmdbdds', '2026-02-15 07:41:09', 10);

-- --------------------------------------------------------

--
-- Table structure for table `properties`
--

CREATE TABLE `properties` (
  `id` int(11) NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` text NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `location` varchar(150) NOT NULL,
  `city` varchar(100) NOT NULL,
  `property_type` varchar(50) NOT NULL,
  `bedrooms` int(11) DEFAULT NULL,
  `bathrooms` int(11) DEFAULT NULL,
  `area_marla` decimal(5,2) DEFAULT NULL,
  `main_image` varchar(255) DEFAULT NULL,
  `additional_images` text DEFAULT NULL,
  `seller_name` varchar(100) NOT NULL,
  `seller_email` varchar(100) NOT NULL,
  `seller_phone` varchar(20) NOT NULL,
  `seller_description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `properties`
--

INSERT INTO `properties` (`id`, `title`, `description`, `price`, `location`, `city`, `property_type`, `bedrooms`, `bathrooms`, `area_marla`, `main_image`, `additional_images`, `seller_name`, `seller_email`, `seller_phone`, `seller_description`, `created_at`) VALUES
(1, '5 Marla Modern House', 'Beautifully designed 5 Marla house with stylish interior, open kitchen concept, tiled flooring, and secure neighborhood.', 14500000.00, 'Bahria Orchard', 'Lahore', 'House', 3, 3, 5.00, 'assets/images/image1.jpg', 'images/properties/house1_1.jpg,images/properties/house1_2.jpg', 'Ali Raza', 'ali.raza@example.com', '03001112222', 'Specialist in residential properties.', '2026-02-11 16:19:59'),
(2, '10 Marla Luxury House', 'Spacious 10 Marla luxury home featuring double TV lounge, modern kitchen, and elegant front elevation.', 28500000.00, 'DHA Phase 7', 'Lahore', 'House', 5, 5, 10.00, 'assets/images/image2.jpg', 'images/properties/house2_1.jpg,images/properties/house2_2.jpg', 'Hassan Malik', 'hassan@example.com', '03112223333', 'Expert in premium DHA properties.', '2026-02-11 16:19:59'),
(3, '3 Marla Budget Home', 'Affordable 3 Marla home ideal for small families. Includes basic amenities and peaceful surroundings.', 8500000.00, 'Raiwind Road', 'Lahore', 'House', 2, 2, 3.00, 'assets/images/image3.jpg', 'images/properties/house3_1.jpg,images/properties/house3_2.jpg', 'Usman Khalid', 'usman@example.com', '03223334444', 'Helping families find affordable homes.', '2026-02-11 16:19:59'),
(4, '8 Marla Corner House', 'Corner 8 Marla property with wide road access, attached bathrooms, and modern interior finishing.', 22000000.00, 'Johar Town', 'Lahore', 'House', 4, 4, 8.00, 'assets/images/image4.jpg', 'images/properties/house4_1.jpg,images/properties/house4_2.jpg', 'Sara Ahmed', 'sara@example.com', '03334445555', 'Experienced property consultant.', '2026-02-11 16:19:59'),
(5, '1 Kanal Executive House', 'Luxurious 1 Kanal house with spacious lawn, imported fittings, and premium architecture.', 52000000.00, 'DHA Phase 6', 'Lahore', 'House', 6, 6, 20.00, 'assets/images/image5.jpg', 'images/properties/house5_1.jpg,images/properties/house5_2.jpg', 'Bilal Khan', 'bilal@example.com', '03445556666', 'Luxury real estate expert.', '2026-02-11 16:19:59'),
(6, '5 Marla Brand New House', 'Brand new 5 Marla house with stylish elevation and modern layout. Ready for possession.', 15500000.00, 'Wapda Town', 'Lahore', 'House', 3, 3, 5.00, 'assets/images/image6.jpg', 'images/properties/house6_1.jpg,images/properties/house6_2.jpg', 'Imran Sheikh', 'imran@example.com', '03056667777', 'Focused on newly built homes.', '2026-02-11 16:19:59'),
(7, '10 Marla Upper Portion', 'Well-maintained upper portion available with separate entrance and parking space.', 16000000.00, 'Model Town', 'Lahore', 'House', 3, 3, 10.00, 'assets/images/image7.jpg', 'images/properties/house7_1.jpg,images/properties/house7_2.jpg', 'Fahad Ali', 'fahad@example.com', '03167778888', 'Specialist in portion sales.', '2026-02-11 16:19:59'),
(8, '2 Marla Studio House', 'Compact and efficient 2 Marla studio house perfect for individuals or rental investment.', 6000000.00, 'Township', 'Lahore', 'House', 1, 1, 2.00, 'assets/images/image8.jpg', 'images/properties/house8_1.jpg,images/properties/house8_2.jpg', 'Ayesha Noor', 'ayesha@example.com', '03278889999', 'Affordable housing consultant.', '2026-02-11 16:19:59'),
(9, '7 Marla Double Story House', 'Spacious 7 Marla double story house with balcony, terrace, and elegant interior.', 19800000.00, 'Gulshan Ravi', 'Lahore', 'House', 4, 4, 7.00, 'assets/images/image9.jpg', 'images/properties/house9_1.jpg,images/properties/house9_2.jpg', 'Kamran Iqbal', 'kamran@example.com', '03389990000', 'Trusted property advisor.', '2026-02-11 16:19:59'),
(10, 'Commercial 5 Marla Plaza', 'Commercial 5 Marla building located in main market area, ideal for shops and offices.', 30000000.00, 'Main Market', 'Lahore', 'Commercial', 0, 2, 5.00, 'assets/images/image10.jpg', 'images/properties/house10_1.jpg,images/properties/house10_2.jpg', 'Zain Abbas', 'zain@example.com', '03490001111', 'Commercial property dealer.', '2026-02-11 16:19:59');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `google_id` varchar(255) DEFAULT NULL,
  `profile_pic` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `google_id`, `profile_pic`) VALUES
(1, 'Abdullah', 'glowwithme', 'dontglowwithme', NULL, NULL),
(2, 'Abdullah Tanveer', 'abdullaee77@gmail.com', '', '108981249586056716147', 'https://lh3.googleusercontent.com/a/ACg8ocI3jwPjDATG7szwKcVczf3yP4LY4_SNr95V0q71tYxeKh6ZmfE=s96-c'),
(3, 'Ali', 'glowwithme5', 'dontglowwithme', NULL, NULL),
(4, 'ahmed', 'glowwithme@gmail.com', 'Abdullah_18&', NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `inquiries`
--
ALTER TABLE `inquiries`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `properties`
--
ALTER TABLE `properties`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `inquiries`
--
ALTER TABLE `inquiries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `properties`
--
ALTER TABLE `properties`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
