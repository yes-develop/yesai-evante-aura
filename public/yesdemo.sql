-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Apr 29, 2025 at 05:05 PM
-- Server version: 10.11.6-MariaDB-0+deb12u1-log
-- PHP Version: 8.3.17

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u58_drclearaligner`
--

-- --------------------------------------------------------

--
-- Table structure for table `automations`
--

CREATE TABLE `automations` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `type` enum('Automatic message','Team Collaboration','Chatbots','Chat Management') NOT NULL,
  `mode` enum('AI','Manual') DEFAULT 'AI',
  `integration` varchar(255) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `response_time` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `activated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `automations`
--

INSERT INTO `automations` (`id`, `user_id`, `name`, `description`, `type`, `mode`, `integration`, `created_by`, `status`, `response_time`, `created_at`, `updated_at`, `activated_at`) VALUES
(1, 7, '5 Mins before change status', 'Trigger the AI chatbot for customer chats that remain unreplied for a specific period.', 'Chatbots', 'AI', 'All', 'admin@mail.com', 'active', 5, '2025-04-22 21:55:20', '2025-04-23 09:14:32', '2025-04-23 01:50:45');

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `check_in` date NOT NULL,
  `check_out` date NOT NULL,
  `room_count` int(11) NOT NULL DEFAULT 1,
  `user_line_id` varchar(34) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `status` enum('pending','waiting_payment','confirmed','canceled','completed') DEFAULT NULL,
  `channel` enum('Booking.com','Agoda','Expedia','Trip.com','Traveloka') DEFAULT NULL,
  `total_price` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `room_id`, `check_in`, `check_out`, `room_count`, `user_line_id`, `full_name`, `phone`, `notes`, `email`, `status`, `channel`, `total_price`, `created_at`, `updated_at`) VALUES
(1, 2, '2025-02-10', '2025-02-12', 1, '123346', 'Marry', '066665555', NULL, NULL, 'confirmed', 'Agoda', NULL, '2025-02-10 00:47:27', NULL),
(2, 2, '2025-02-10', '2025-02-12', 1, '123346', 'Marry', '066665555', NULL, NULL, 'waiting_payment', 'Traveloka', NULL, '2025-02-10 00:53:51', NULL),
(4, 2, '2025-02-10', '2025-02-12', 1, 'U1233dfdfsea5566646', 'Marry', '066665555', NULL, NULL, 'canceled', 'Trip.com', NULL, '2025-02-10 00:55:41', NULL),
(5, 1, '2025-02-15', '2025-02-17', 2, 'U1233dfdfsea5566646', 'Marry', '066665555', NULL, NULL, 'completed', 'Agoda', NULL, '2025-02-10 01:20:58', NULL),
(6, 1, '2025-02-15', '2025-02-17', 2, 'U1233dfdfsea5566646', 'Marry', '066665555', NULL, NULL, 'pending', 'Booking.com', NULL, '2025-02-10 01:24:22', NULL),
(7, 2, '2025-02-15', '2025-02-17', 1, 'U1233dfdfsea5566646', 'Marry', '066665555', NULL, NULL, 'pending', 'Expedia', NULL, '2025-02-10 01:50:18', NULL),
(8, 2, '2025-02-15', '2025-02-17', 1, '123456', 'Marry', '066665555', NULL, NULL, 'pending', 'Expedia', NULL, '2025-02-10 03:27:12', NULL),
(9, 1, '2025-02-18', '2025-02-19', 4, 'U1233dfdfsea78', 'May', '0555', NULL, NULL, 'pending', 'Traveloka', NULL, '2025-02-12 20:10:22', NULL),
(10, 1, '2025-02-18', '2025-02-19', 4, 'U123aaa', 'May', '0555', NULL, NULL, 'pending', 'Trip.com', NULL, '2025-02-12 20:46:12', NULL),
(11, 1, '2025-02-18', '2025-02-19', 4, 'U123bbb', 'June', '0222', NULL, NULL, 'pending', 'Traveloka', NULL, '2025-02-12 20:56:33', NULL),
(12, 1, '2025-02-18', '2025-02-19', 4, 'U123bbb', 'June', '0222', NULL, NULL, 'pending', 'Trip.com', NULL, '2025-02-12 21:56:15', NULL),
(13, 1, '2025-02-25', '2025-02-26', 4, 'U123bbb', 'June', '0222', NULL, NULL, 'pending', 'Trip.com', NULL, '2025-02-12 21:57:36', NULL),
(14, 2, '2025-03-25', '2025-03-26', 4, 'abcde', 'April', '0111', NULL, NULL, 'pending', 'Trip.com', NULL, '2025-02-12 22:06:04', NULL),
(15, 2, '2025-03-25', '2025-03-26', 4, 'abcde', 'April', '0111', NULL, NULL, 'pending', 'Trip.com', NULL, '2025-02-12 22:57:42', NULL),
(16, 2, '2025-03-25', '2025-03-26', 4, 'abcde', 'April', '0111', NULL, NULL, 'pending', 'Booking.com', NULL, '2025-02-16 23:30:00', NULL),
(17, 1, '2025-03-28', '2025-03-30', 1, 'U1212312121', 'Pure', '0985058047', NULL, NULL, 'pending', 'Booking.com', NULL, '2025-02-18 01:24:18', NULL),
(18, 1, '2025-03-28', '2025-03-30', 1, 'utest18022025', 'Pure', '0985058047', NULL, NULL, 'pending', 'Booking.com', NULL, '2025-02-18 01:33:55', NULL),
(19, 1, '2025-03-28', '2025-03-30', 1, 'utest18022025', 'Pure', '0985058047', NULL, NULL, 'pending', 'Traveloka', NULL, '2025-02-18 01:34:34', NULL),
(20, 1, '2025-03-28', '2025-03-30', 1, 'utest18022025', 'Pure', '0985058047', NULL, NULL, 'pending', 'Agoda', NULL, '2025-02-18 01:34:48', NULL),
(24, 8, '2025-03-15', '2025-03-16', 3, 'utest18022025new', 'Pure', '0985058047', NULL, NULL, 'pending', 'Booking.com', NULL, '2025-02-18 04:34:31', NULL),
(25, 8, '2025-03-15', '2025-03-16', 3, 'User19022568', 'Pure', '0985058047', NULL, NULL, 'pending', 'Booking.com', NULL, '2025-02-18 23:29:22', NULL),
(26, 8, '2025-03-15', '2025-03-16', 3, 'utest18022025new', 'Pure', '0985058047', NULL, NULL, 'pending', 'Trip.com', NULL, '2025-02-19 02:04:56', NULL),
(27, 8, '2025-03-15', '2025-03-16', 3, 'utest18022025new', 'Pure', '0985058047', NULL, NULL, 'confirmed', 'Traveloka', NULL, '2025-02-21 03:01:40', NULL),
(31, 1, '2025-03-07', '2025-03-08', 1, '1122334455', 'admin ok', '0632233311', NULL, 'admin@mail.com', 'pending', 'Expedia', -2538.00, '2025-03-06 17:07:56', '2025-03-06 17:07:56'),
(32, 8, '2025-03-15', '2025-03-16', 3, 'utest25022025new', 'Pure', '0985058047', NULL, NULL, 'pending', 'Traveloka', NULL, '2025-03-07 01:10:26', NULL),
(33, 8, '2025-03-15', '2025-03-16', 3, 'utest25022025new', 'Test fromapi', '888888888', NULL, NULL, 'pending', 'Expedia', NULL, '2025-03-07 01:11:49', NULL),
(34, 8, '2025-03-15', '2025-03-16', 3, 'utest25022025new', 'Test fromapi2', '888888888', NULL, NULL, 'pending', 'Agoda', NULL, '2025-03-07 01:57:25', NULL),
(35, 8, '2025-03-15', '2025-03-16', 3, 'utest25022025new', 'Test fromapi2', '888888888', NULL, NULL, 'pending', 'Trip.com', NULL, '2025-03-07 02:02:18', NULL),
(36, 1, '2025-03-08', '2025-03-09', 2, 'U8936c4466bff258d1ee30153e2659019', 'OleReload', '0863732294', NULL, NULL, 'pending', 'Agoda', NULL, '2025-03-07 02:41:58', NULL),
(37, 2, '2025-03-10', '2025-03-12', 2, 'U8936c4466bff258d1ee30153e2659019', 'ole reload', '0863732294', NULL, NULL, 'pending', 'Expedia', NULL, '2025-03-09 23:09:57', NULL),
(38, 2, '2025-03-15', '2025-03-20', 1, 'U201376fe1bb68082ea2698c2e760b59f', 'Jimmy', '0999999999', NULL, NULL, 'pending', 'Trip.com', NULL, '2025-03-11 22:36:30', NULL),
(39, 2, '2025-03-15', '2025-03-20', 1, 'U201376fe1bb68082ea2698c2e760b59f', 'Jimmy', '0999999999', NULL, NULL, 'pending', 'Expedia', NULL, '2025-03-12 06:11:55', NULL),
(40, 1, '2025-03-13', '2025-03-14', 2, 'U8936c4466bff258d1ee30153e2659019', 'OleReload', '863732294', NULL, NULL, 'pending', 'Booking.com', NULL, '2025-03-12 19:45:21', NULL),
(41, 2, '2025-03-13', '2025-03-14', 2, 'U8936c4466bff258d1ee30153e2659019', 'Ole', '9999999999', NULL, NULL, 'pending', 'Traveloka', NULL, '2025-03-12 21:17:16', NULL),
(42, 1, '2025-03-15', '2025-03-17', 1, 'U8936c4466bff258d1ee30153e2659019', 'สมชาย ใจดี', '0987654321', NULL, NULL, 'pending', 'Traveloka', NULL, '2025-03-12 21:49:30', NULL),
(43, 1, '2025-04-20', '2025-04-30', 1, 'Ubd8e9ab2f84287851524f0dfbf2b7183', 'Murray Ashley', '940840579', NULL, NULL, 'waiting_payment', 'Traveloka', NULL, '2025-03-13 02:05:54', NULL),
(44, 2, '2025-03-14', '2025-03-16', 2, 'U8936c4466bff258d1ee30153e2659019', 'OleReload', '888888888', NULL, NULL, 'pending', 'Expedia', NULL, '2025-03-13 03:27:04', NULL),
(45, 1, '2025-03-17', '2025-03-19', 1, 'U8936c4466bff258d1ee30153e2659019', 'Ole', '0863732294', NULL, NULL, 'pending', 'Trip.com', NULL, '2025-03-17 02:34:48', NULL),
(46, 1, '2025-03-21', '2025-03-23', 2, 'U8936c4466bff258d1ee30153e2659019', 'Aloe', '9999999999', NULL, NULL, 'pending', 'Agoda', NULL, '2025-03-21 00:27:16', NULL),
(47, 2, '2025-03-31', '2025-04-01', 2, 'U8936c4466bff258d1ee30153e2659019', 'OleReload', '89991231', NULL, NULL, 'pending', 'Agoda', NULL, '2025-03-31 01:18:39', NULL),
(48, 1, '2025-04-01', '2025-04-02', 2, 'U8936c4466bff258d1ee30153e2659019', 'OleReload', '0863732294', NULL, NULL, 'pending', 'Booking.com', NULL, '2025-03-31 08:12:45', NULL),
(49, 2, '2025-04-01', '2025-04-02', 2, 'U8936c4466bff258d1ee30153e2659019', 'OleReload', '863732294', NULL, NULL, 'pending', 'Traveloka', NULL, '2025-03-31 21:13:23', NULL),
(50, 2, '2025-04-01', '2025-04-02', 1, 'U8936c4466bff258d1ee30153e2659019', 'Ole Reload', '0863732294', NULL, NULL, 'pending', 'Expedia', NULL, '2025-03-31 21:24:22', NULL),
(51, 2, '2025-04-01', '2025-04-03', 2, 'U8936c4466bff258d1ee30153e2659019', 'OleReload', '863732294', NULL, NULL, 'pending', 'Traveloka', NULL, '2025-04-01 01:15:41', NULL),
(54, 2, '2025-04-25', '2025-04-27', 2, 'U8936c4466bff258d1ee30153e2659019', 'OleReload', '099999999', NULL, NULL, 'pending', NULL, NULL, '2025-04-24 23:19:27', NULL),
(55, 2, '2025-04-25', '2025-04-27', 2, 'U8936c4466bff258d1ee30153e2659019', 'Aloe', '0863732294', NULL, NULL, 'pending', NULL, NULL, '2025-04-24 23:48:06', NULL),
(56, 2, '2025-04-25', '2025-04-28', 2, 'U8936c4466bff258d1ee30153e2659019', 'Aloe', '07777777777', NULL, NULL, 'pending', NULL, NULL, '2025-04-25 08:12:06', NULL),
(57, 8, '2025-03-15', '2025-03-16', 3, 'utest18022025new', 'Pure', '0985058047', NULL, NULL, 'pending', NULL, NULL, '2025-04-25 08:15:17', NULL),
(58, 2, '2025-04-25', '2025-04-27', 2, 'U8936c4466bff258d1ee30153e2659019', 'Aloe', '092334325', NULL, NULL, 'pending', NULL, NULL, '2025-04-25 09:07:52', NULL),
(59, 8, '2025-03-15', '2025-03-16', 3, 'utest18022025new', 'Pure', '0985058047', NULL, NULL, 'pending', NULL, NULL, '2025-04-25 09:08:57', NULL),
(106, 8, '2025-03-15', '2025-03-16', 3, 'utest18022025new', 'Pure', '0985058047', NULL, NULL, 'pending', NULL, NULL, '2025-04-25 09:14:20', NULL),
(107, 2, '2025-04-25', '2025-04-28', 2, 'U8936c4466bff258d1ee30153e2659019', 'Aloe', '0999324242', NULL, NULL, 'pending', NULL, NULL, '2025-04-25 09:23:23', NULL),
(108, 9, '2025-04-27', '2025-04-29', 2, 'U8936c4466bff258d1ee30153e2659019', 'Yes Alor', '89999324', NULL, NULL, 'pending', NULL, NULL, '2025-04-27 09:30:54', NULL),
(109, 11, '2025-04-29', '2025-05-01', 1, 'U8936c4466bff258d1ee30153e2659019', 'Yes Aloe', '09994345345', NULL, NULL, 'pending', NULL, NULL, '2025-04-29 04:43:04', NULL),
(110, 7, '2025-04-29', '2025-05-01', 2, 'U8936c4466bff258d1ee30153e2659019', 'Aloe111', '923123123', NULL, NULL, 'pending', NULL, NULL, '2025-04-29 08:21:03', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `branches`
--

CREATE TABLE `branches` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` longtext DEFAULT NULL,
  `image` text NOT NULL,
  `location` varchar(255) NOT NULL,
  `map_url` text NOT NULL,
  `tel` varchar(20) DEFAULT NULL,
  `nearby_shoppingmall` longtext NOT NULL,
  `nearby_attractions` longtext NOT NULL,
  `nearby_industrialestates` longtext NOT NULL,
  `nearby_governmentinstitutions` longtext NOT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `last_updated` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `branches`
--

INSERT INTO `branches` (`id`, `name`, `description`, `image`, `location`, `map_url`, `tel`, `nearby_shoppingmall`, `nearby_attractions`, `nearby_industrialestates`, `nearby_governmentinstitutions`, `updated_at`, `last_updated`) VALUES
(1, 'Go Hotel Bowin', 'Enjoy an elevated stay experience with modern services that offer relaxation, convenience, and safety at GO Hotel Bowin, the first branch located near Robinson Lifestyle Bowin and WHA Industrial Estate. The hotel offers two room types: GO! Double and GO! Twin, complete with blackout curtains, private workspaces, and high-speed internet, ensuring comfort for both relaxation and work.', 'https://letzzzgo.co/wp-content/uploads/2024/10/Bowin1-1-scaled.jpg', 'Bowin,Sriracha, Chonburi', 'https://www.google.com/maps/place/GO+Hotel+Bowin+at+Robinson+Lifestyle+Bowin/@13.04043,101.0811967,17z/data=!3m1!4b1!4m9!3m8!1s0x3102c5c5dce7ef2d:0x4e1676a170198db4!5m2!4m1!1i2!8m2!3d13.04043!4d101.0811967!16s%2Fg%2F11tf6wd5hv?entry=ttu&g_ep=EgoyMDI1MDIxMi4wIKXMDSoASAFQAw%3D%3D', NULL, '[\"Robinson Lifestyle Bowin\"]', '[\"Pattana Sports Club Golf Course\",\"Khao Mai Kaew Nature Trail\",\"Treasure Hill Golf Club\"]', '[\"Amata City Rayong\",\"Rojana Industrial Park Chonburi 2\",\"Siam Eastern Industrial Park\",\"Pinthong Industrial Park\",\"WHA Eastern Seaboard\"]', '[\"Suankularb Wittayalai Chonburi School\"]', NULL, NULL),
(2, 'Go Hotel Ban Chang', 'Experience premium comfort at affordable prices in Banchang, Rayong, located in the EEC zone. GO Hotel Banchang offers two room types: GO! Double and GO! Twin, with a pet-friendly option. Guests can also work and relax with private meeting rooms and co-working spaces.', 'https://letzzzgo.co/wp-content/uploads/2024/10/BANCHANG1.jpg', 'Tumbon Ban Chang, Amphor Ban Chang, Rayong', 'https://www.google.com/maps/place/GO+Hotel+Ban+Chang+at+Robinson+Lifestyle+Ban+Chang/data=!4m2!3m1!1s0x0:0x21342891c5eb598b?sa=X&ved=1t:2428&ictx=111', NULL, '[\"Robinson Lifestyle Ban Chang\",\"Central Rayong\"]', '[\"The Emerald Golf Club\",\"PTTLNG Flora Exhibition Hall\"]', '[\"Map Ta Phut Industrial Estate\"]', '[\"U-Tapao Airport\"]', NULL, NULL),
(3, 'Go Hotel Si Racha', 'Enjoy premium relaxation at affordable rates in Si Racha.\r\n\r\nLocated near the beach, GO Hotel Si Racha offers GO! Double and GO! Twin rooms, workspaces, meeting rooms, and green spaces. The hotel is designed to ensure guests can recharge and refresh, offering both daytime and nighttime relaxation with specially curated items for a restful stay.\r\n\r\nGet work done in our cozy spaces, perfect for meetings or relaxing with board games. Snacks and drinks are available 24/7.', 'https://letzzzgo.co/wp-content/uploads/2024/10/SIRACHA1-e1729823843298.jpg', 'Sukhumvit Road, Si Racha, Si Racha District, Chonburi', 'https://www.google.com/maps/place/GO+Hotel+Si+Racha+at+Central+Si+Racha/@13.181422,100.9289198,17z/data=!3m1!4b1!4m9!3m8!1s0x3102b7601ba29211:0xb9c5a4afa790d569!5m2!4m1!1i2!8m2!3d13.181422!4d100.9314947!16s%2Fg%2F11tmz_1kx5?entry=ttu&g_ep=EgoyMDI1MDIxMi4wIKXMDSoASAFQAw%3D%3D', NULL, '[\"Central Si Racha\"]', '[\"Koh Loy Si Racha\"]', '[\"Laem Chabang Industrial Estate\",\"Laem Chabang Port\"]', '[\"Darasamutr School, Si Racha\",\"Burapha University\"]', NULL, NULL),
(4, 'Go Hotel Chonburi', 'Stay near the sea while enjoying the complete lifestyle of a shopping complex in Chonburi. GO Hotel Chonburi offers two room types: GO! Double and GO! Twin, along with green spaces and modern amenities for relaxation and work. Rooms are designed with blackout curtains and large beds for ultimate comfort.\r\n\r\nThe green garden area is designed and arranged to allow guests to relax their eyes with a variety of plants and trees.', 'https://letzzzgo.co/wp-content/uploads/2024/10/image-18.webp', 'Samet Subdistrict, Mueang Chonburi District, Chonburi', 'https://www.google.com/maps/place/GO+Hotel+Chonburi/@13.3371133,100.9657377,17z/data=!3m1!4b1!4m9!3m8!1s0x311d4b9f67740445:0xcd0a05a4b98c38a1!5m2!4m1!1i2!8m2!3d13.3371133!4d100.9683126!16s%2Fg%2F11kbpj8sfr?entry=ttu&g_ep=EgoyMDI1MDIxMi4wIKXMDSoASAFQAw%3D%3D', NULL, '[\"Central Chonburi\",\"Go Wholesale Amata\"]', '[\"Cholamarkwithi Bridge\",\"Ang Sila Fish Bridge\",\"Bang Saen Beach\"]', '[\"Amata Nakorn Industrial Estate\"]', '[\"Sripatum University, Chonburi\"]', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `labels`
--

CREATE TABLE `labels` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `color` varchar(7) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `labels`
--

INSERT INTO `labels` (`id`, `name`, `color`, `created_at`) VALUES
(15, 'VIP', '#ff0000', '2025-04-03 08:08:44'),
(18, 'Pending', '#ffd500', '2025-04-04 02:41:10'),
(19, 'Follow Up', '#11ff00', '2025-04-04 02:41:21'),
(20, 'Important', '#009dff', '2025-04-04 02:41:33'),
(21, 'YesAI', '#d1ca00', '2025-04-09 09:39:15'),
(22, 'YesAiGroup', '#ff0000', '2025-04-09 09:44:45');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2014_10_12_000000_create_users_table', 1);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `branch_id` int(11) NOT NULL,
  `price_per_night` decimal(10,2) NOT NULL,
  `discount` decimal(5,2) DEFAULT 0.00,
  `max_guests` int(11) NOT NULL,
  `bed_type` varchar(255) NOT NULL,
  `size_room` varchar(255) NOT NULL,
  `status` enum('available','unavailable') DEFAULT 'available',
  `amenities` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `total_rooms` int(11) NOT NULL DEFAULT 10
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rooms`
--

INSERT INTO `rooms` (`id`, `name`, `description`, `branch_id`, `price_per_night`, `discount`, `max_guests`, `bed_type`, `size_room`, `status`, `amenities`, `created_at`, `total_rooms`) VALUES
(1, 'Go Double', 'XL king size bed, Ready to rest all day!\r\n6.5 feet wide – wider than any other bed out there!', 1, 2538.00, 0.00, 2, 'XL King Size Bed', '6.5 feet', 'available', '\"[\\\"Air conditioning\\\",\\\"City view\\\",\\\"Garden view\\\",\\\"Free bottle water\\\",\\\"Hair conditioning\\\",\\\"Water heater\\\",\\\"LCD television\\\",\\\"Work desk\\\",\\\"Fridge\\\",\\\"Body gel or soap\\\",\\\"Desk chair\\\",\\\"Cable or satellite television\\\",\\\"Shampoo\\\"]\"', '2025-02-18 09:52:45', 15),
(2, 'Go Twin', 'Best Place with your pals 3.25 feet wide – providing extra personal space.', 1, 2538.00, 0.00, 2, 'Twin Bed', '3.25 feet', 'available', '[\"Air conditioning\",\"Body gel or soap\",\"Cable or satellite television\",\"City view\",\"Desk chair\",\"Free bottle water\",\"Fridge\",\"Garden view\",\"Hair conditioning\",\"LCD television\",\"Shampoo\",\"Water heater\",\"Work desk\"]', '2025-02-18 09:52:45', 20),
(6, 'Go Double', 'XL king size bed, Ready to rest all day!\r\n6.5 feet wide – wider than any other bed out there!\r\n', 2, 2538.00, 0.00, 2, 'XL King Size Bed', '6.5 feet', 'available', '[\"Air conditioning\",\"Body gel or soap\",\"Cable or satellite television\",\"City view\",\"Desk chair\",\"Free bottle water\",\"Fridge\",\"Garden view\",\"Hair conditioning\",\"LCD television\",\"Shampoo\",\"Water heater\",\"Work desk\"]', '2025-02-18 09:52:45', 15),
(7, 'Go Twin', 'Best Place with your pals 3.25 feet wide – providing extra personal space.', 2, 2538.00, 0.00, 2, 'Twin Bed', '3.25 feet', 'available', '\"[\\\"Air conditioning\\\",\\\"City view\\\",\\\"Garden view\\\",\\\"Free bottle water\\\",\\\"Hair conditioning\\\",\\\"Water heater\\\",\\\"LCD television\\\",\\\"Work desk\\\",\\\"Fridge\\\",\\\"Body gel or soap\\\",\\\"Desk chair\\\",\\\"Cable or satellite television\\\",\\\"Shampoo\\\"]\"', '2025-02-18 09:52:45', 20),
(8, 'Go Double', 'XL king size bed, Ready to rest all day!\r\n6.5 feet wide – wider than any other bed out there!\r\n', 3, 2538.00, 0.00, 2, 'XL King Size Bed', '6.5 feet', 'available', '[\"Air conditioning\",\"Body gel or soap\",\"Cable or satellite television\",\"City view\",\"Desk chair\",\"Free bottle water\",\"Fridge\",\"Garden view\",\"Hair conditioning\",\"LCD television\",\"Shampoo\",\"Water heater\",\"Work desk\"]', '2025-02-18 09:52:45', 15),
(9, 'Go Twin', 'Best Place with your pals 3.25 feet wide – providing extra personal space.\r\n', 3, 2538.00, 0.00, 2, 'Twin Bed', '3.25 feet', 'available', '[\"Air conditioning\",\"Body gel or soap\",\"Cable or satellite television\",\"City view\",\"Desk chair\",\"Free bottle water\",\"Fridge\",\"Garden view\",\"Hair conditioning\",\"LCD television\",\"Shampoo\",\"Water heater\",\"Work desk\"]', '2025-02-18 09:52:45', 20),
(10, 'Go Double', 'XL king size bed, Ready to rest all day!\r\n6.5 feet wide – wider than any other bed out there!\r\n', 4, 2538.00, 0.00, 2, 'XL King Size Bed', '6.5 feet', 'available', '[\"Air conditioning\",\"Body gel or soap\",\"Cable or satellite television\",\"City view\",\"Desk chair\",\"Free bottle water\",\"Fridge\",\"Garden view\",\"Hair conditioning\",\"LCD television\",\"Shampoo\",\"Water heater\",\"Work desk\"]', '2025-02-18 09:52:45', 15),
(11, 'Go Twin', 'Best Place with your pals 3.25 feet wide – providing extra personal space.', 4, 2538.00, 500.00, 2, 'Twin Bed', '3.25 feet', 'available', '\"[\\\"Air conditioning\\\",\\\"City view\\\",\\\"Garden view\\\",\\\"Free bottle water\\\",\\\"Hair conditioning\\\",\\\"Water heater\\\",\\\"LCD television\\\",\\\"Work desk\\\",\\\"Fridge\\\",\\\"Body gel or soap\\\",\\\"Desk chair\\\",\\\"Cable or satellite television\\\",\\\"Shampoo\\\"]\"', '2025-02-18 09:52:45', 20);

-- --------------------------------------------------------

--
-- Table structure for table `room_images`
--

CREATE TABLE `room_images` (
  `id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `image_url` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `room_images`
--

INSERT INTO `room_images` (`id`, `room_id`, `image_url`) VALUES
(1, 1, 'https://images.travelanium.net/crs-file-manager/images/room?propertyid=1027&group=3&width=600&height=400&imageid=64718&type=jpg&rv=1739547195'),
(2, 1, 'https://images.travelanium.net/crs-file-manager/images/room?propertyid=1027&group=3&width=600&height=400&imageid=64719&type=jpg&rv=1739547195'),
(3, 1, 'https://images.travelanium.net/crs-file-manager/images/room?propertyid=1027&group=3&width=600&height=400&imageid=64720&type=jpg&rv=1739547195'),
(4, 2, 'https://images.travelanium.net/crs-file-manager/images/room?propertyid=1027&group=3&width=600&height=400&imageid=64721&type=jpg&rv=1739547195'),
(5, 2, 'https://images.travelanium.net/crs-file-manager/images/room?propertyid=1027&group=3&width=600&height=400&imageid=64723&type=jpg&rv=1739547195\\'),
(6, 2, 'https://images.travelanium.net/crs-file-manager/images/room?propertyid=1027&group=3&width=600&height=400&imageid=64723&type=jpg&rv=1739547195'),
(7, 6, 'https://images.travelanium.net/crs-file-manager/images/room?propertyid=1027&group=3&width=600&height=400&imageid=64718&type=jpg&rv=1739547195'),
(8, 6, 'https://images.travelanium.net/crs-file-manager/images/room?propertyid=1027&group=3&width=600&height=400&imageid=64719&type=jpg&rv=1739547195'),
(9, 6, 'https://images.travelanium.net/crs-file-manager/images/room?propertyid=1027&group=3&width=600&height=400&imageid=64720&type=jpg&rv=1739547195'),
(10, 7, 'https://images.travelanium.net/crs-file-manager/images/room?propertyid=1027&group=3&width=600&height=400&imageid=64721&type=jpg&rv=1739547195'),
(11, 7, 'https://images.travelanium.net/crs-file-manager/images/room?propertyid=1027&group=3&width=600&height=400&imageid=64723&type=jpg&rv=1739547195\\'),
(12, 7, 'https://images.travelanium.net/crs-file-manager/images/room?propertyid=1027&group=3&width=600&height=400&imageid=64723&type=jpg&rv=1739547195'),
(13, 8, 'https://images.travelanium.net/crs-file-manager/images/room?propertyid=1027&group=3&width=600&height=400&imageid=64718&type=jpg&rv=1739547195'),
(14, 8, 'https://images.travelanium.net/crs-file-manager/images/room?propertyid=1027&group=3&width=600&height=400&imageid=64719&type=jpg&rv=1739547195'),
(15, 8, 'https://images.travelanium.net/crs-file-manager/images/room?propertyid=1027&group=3&width=600&height=400&imageid=64720&type=jpg&rv=1739547195'),
(16, 9, 'https://images.travelanium.net/crs-file-manager/images/room?propertyid=1027&group=3&width=600&height=400&imageid=64721&type=jpg&rv=1739547195'),
(17, 9, 'https://images.travelanium.net/crs-file-manager/images/room?propertyid=1027&group=3&width=600&height=400&imageid=64723&type=jpg&rv=1739547195\\'),
(18, 9, 'https://images.travelanium.net/crs-file-manager/images/room?propertyid=1027&group=3&width=600&height=400&imageid=64723&type=jpg&rv=1739547195'),
(19, 10, 'https://images.travelanium.net/crs-file-manager/images/room?propertyid=1027&group=3&width=600&height=400&imageid=64718&type=jpg&rv=1739547195'),
(20, 10, 'https://images.travelanium.net/crs-file-manager/images/room?propertyid=1027&group=3&width=600&height=400&imageid=64719&type=jpg&rv=1739547195'),
(21, 10, 'https://images.travelanium.net/crs-file-manager/images/room?propertyid=1027&group=3&width=600&height=400&imageid=64720&type=jpg&rv=1739547195'),
(22, 11, 'https://images.travelanium.net/crs-file-manager/images/room?propertyid=1027&group=3&width=600&height=400&imageid=64721&type=jpg&rv=1739547195'),
(23, 11, 'https://images.travelanium.net/crs-file-manager/images/room?propertyid=1027&group=3&width=600&height=400&imageid=64723&type=jpg&rv=1739547195\\'),
(24, 11, 'https://images.travelanium.net/crs-file-manager/images/room?propertyid=1027&group=3&width=600&height=400&imageid=64723&type=jpg&rv=1739547195');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES
(7, 'Admin', 'admin@mail.com', NULL, '$2y$12$RwLZVxoLghamzwgOIlMequaUtfSozaIW6dNpewFAGEs5Uru7ixa6m', 'v8aJdfIw1xUNOdmF33QFN6A39tqsugKulCDQ8xg8J7fnHTlAOdeCzXIkVoEu', '2025-03-02 21:51:39', '2025-03-02 21:51:39');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `automations`
--
ALTER TABLE `automations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `branches`
--
ALTER TABLE `branches`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `labels`
--
ALTER TABLE `labels`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `automations`
--
ALTER TABLE `automations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=111;

--
-- AUTO_INCREMENT for table `branches`
--
ALTER TABLE `branches`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `labels`
--
ALTER TABLE `labels`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
