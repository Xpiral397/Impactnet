import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  FlatList,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

interface MarketItem {
  id: string;
  title: string;
  price: number;
  image: string;
  seller: string;
  location: string;
  distance: string;
  delivery: boolean;
  rating: number;
  promotion?: 'BOGO' | 'FLASH_SALE' | 'DISCOUNT';
  discount?: number;
}

interface GigReward {
  basePay: number;
  fuelCost: number;
  netEarnings: number;
  timeBonus: number; // Percentage bonus for fast acceptance
  estimatedMinutes: number;
  distanceKm: number;
}

export default function MarketplaceScreen() {
  const [activeTab, setActiveTab] = useState<'browse' | 'sell' | 'orders' | 'deliver'>('browse');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate fuel cost and rewards
  const calculateGigReward = (distanceKm: number, basePay: number, acceptanceTimeMinutes: number = 0): GigReward => {
    // Fuel consumption: Average 10 km per liter
    // Fuel price: $1.50 per liter (adjustable)
    const kmPerLiter = 10;
    const fuelPricePerLiter = 1.5;
    const litersNeeded = distanceKm / kmPerLiter;
    const fuelCost = litersNeeded * fuelPricePerLiter;

    // Time-based bonus multiplier
    let timeBonus = 100; // 100% if accepted immediately
    if (acceptanceTimeMinutes > 60) {
      timeBonus = 80; // 80% if accepted after 1 hour
    } else if (acceptanceTimeMinutes > 30) {
      timeBonus = 90; // 90% if accepted after 30 mins
    } else if (acceptanceTimeMinutes > 10) {
      timeBonus = 95; // 95% if accepted after 10 mins
    }

    const actualPay = basePay * (timeBonus / 100);
    const netEarnings = actualPay - fuelCost;

    // Estimated time: 30 km/h average speed in city
    const averageSpeed = 30;
    const estimatedMinutes = Math.ceil((distanceKm / averageSpeed) * 60);

    return {
      basePay: actualPay,
      fuelCost,
      netEarnings,
      timeBonus,
      estimatedMinutes,
      distanceKm,
    };
  };

  // Mock data - will be replaced with API calls
  const items: MarketItem[] = [
    {
      id: '1',
      title: 'Fresh Organic Apples',
      price: 5.99,
      image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&h=400&fit=crop',
      seller: 'John\'s Farm',
      location: 'Downtown Market',
      distance: '0.5 mi',
      delivery: true,
      rating: 4.8,
      promotion: 'BOGO',
      discount: 50,
    },
    {
      id: '2',
      title: 'Handmade Wooden Chair',
      price: 89.99,
      image: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop',
      seller: 'Wood Crafts Co',
      location: 'Central District',
      distance: '1.2 mi',
      delivery: true,
      rating: 4.9,
      promotion: 'FLASH_SALE',
      discount: 30,
    },
    {
      id: '3',
      title: 'Vintage Camera',
      price: 299.99,
      image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop',
      seller: 'Tech Resale',
      location: 'East Side',
      distance: '2.1 mi',
      delivery: false,
      rating: 4.6,
    },
  ];

  const renderBrowseTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* Premium AI Shopping Assistant */}
      <TouchableOpacity activeOpacity={0.9} style={styles.premiumAICard}>
        <LinearGradient
          colors={['#7C3AED', '#6D28D9', '#5B21B6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.aiGradientContainer}
        >
          <View style={styles.aiContentRow}>
            <View style={styles.aiIconBox}>
              <LinearGradient
                colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                style={styles.aiIconGradient}
              >
                <MaterialIcon name="robot-outline" size={36} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <View style={styles.aiTextContent}>
              <Text style={styles.aiTitlePremium}>AI Shopping Assistant</Text>
              <Text style={styles.aiSubtitlePremium}>Let AI find exactly what you need</Text>
            </View>
            <View style={styles.aiArrowContainer}>
              <Icon name="chevron-forward" size={24} color="rgba(255,255,255,0.9)" />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Premium Categories */}
      <View style={styles.categoriesContainer}>
        <Text style={styles.sectionTitle}>Shop by Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          <TouchableOpacity style={styles.categoryCardPremium}>
            <LinearGradient
              colors={['#06B6D4', '#0891B2']}
              style={styles.categoryIconPremium}
            >
              <MaterialIcon name="food-apple" size={28} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.categoryTextPremium}>Food</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.categoryCardPremium}>
            <LinearGradient
              colors={['#F43F5E', '#E11D48']}
              style={styles.categoryIconPremium}
            >
              <MaterialIcon name="tshirt-crew" size={28} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.categoryTextPremium}>Fashion</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.categoryCardPremium}>
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED']}
              style={styles.categoryIconPremium}
            >
              <MaterialIcon name="sofa" size={28} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.categoryTextPremium}>Furniture</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.categoryCardPremium}>
            <LinearGradient
              colors={['#FBBF24', '#F59E0B']}
              style={styles.categoryIconPremium}
            >
              <MaterialIcon name="laptop" size={28} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.categoryTextPremium}>Electronics</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.categoryCardPremium}>
            <LinearGradient
              colors={['#6366F1', '#4F46E5']}
              style={styles.categoryIconPremium}
            >
              <MaterialIcon name="grid" size={28} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.categoryTextPremium}>More</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Nearby Items */}
      <View style={styles.itemsContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Items</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View Map</Text>
          </TouchableOpacity>
        </View>

        {items.map((item) => (
          <TouchableOpacity key={item.id} style={styles.premiumItemCard} activeOpacity={0.9}>
            <View style={styles.itemImageContainer}>
              <Image source={{ uri: item.image }} style={styles.itemImagePremium} />
              {/* Promotional Badge */}
              {item.promotion && (
                <View style={styles.promotionBadgeContainer}>
                  {item.promotion === 'BOGO' && (
                    <LinearGradient
                      colors={['#F472B6', '#EC4899']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.promotionBadge}
                    >
                      <Text style={styles.promotionText}>BOGO</Text>
                      <Text style={styles.promotionSubtext}>Buy 1 Get 1</Text>
                    </LinearGradient>
                  )}
                  {item.promotion === 'FLASH_SALE' && (
                    <LinearGradient
                      colors={['#FCD34D', '#F59E0B']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.promotionBadge}
                    >
                      <Icon name="flash" size={14} color="#FFFFFF" />
                      <Text style={styles.promotionText}>{item.discount}% OFF</Text>
                    </LinearGradient>
                  )}
                </View>
              )}
            </View>
            <View style={styles.itemDetailsPremium}>
              <View style={styles.itemTopRow}>
                <Text style={styles.itemTitlePremium}>{item.title}</Text>
                <View style={styles.itemRatingPremium}>
                  <Icon name="star" size={16} color="#F59E0B" />
                  <Text style={styles.ratingTextPremium}>{item.rating}</Text>
                </View>
              </View>

              <View style={styles.itemMetaPremium}>
                <Icon name="location" size={14} color="#14B8A6" />
                <Text style={styles.itemLocationPremium}>{item.location}</Text>
                <View style={styles.distancePill}>
                  <Text style={styles.distanceTextPill}>{item.distance}</Text>
                </View>
              </View>

              <View style={styles.itemFooterPremium}>
                <View style={styles.priceContainer}>
                  {item.discount ? (
                    <>
                      <Text style={styles.originalPrice}>${item.price.toFixed(2)}</Text>
                      <Text style={styles.itemPricePremium}>${(item.price * (1 - item.discount / 100)).toFixed(2)}</Text>
                    </>
                  ) : (
                    <Text style={styles.itemPricePremium}>${item.price.toFixed(2)}</Text>
                  )}
                </View>
                {item.delivery && (
                  <View style={styles.deliveryBadgePremium}>
                    <LinearGradient
                      colors={['#D1FAE5', '#A7F3D0']}
                      style={styles.deliveryBadgeGradient}
                    >
                      <MaterialIcon name="truck-delivery" size={14} color="#065F46" />
                      <Text style={styles.deliveryTextPremium}>Delivery</Text>
                    </LinearGradient>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderSellTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.sellContainer}>
        <View style={styles.sellHeader}>
          <MaterialIcon name="store" size={48} color="#3B82F6" />
          <Text style={styles.sellTitle}>Start Selling Today</Text>
          <Text style={styles.sellSubtitle}>
            Turn your items into cash or become a merchant
          </Text>
        </View>

        <TouchableOpacity style={styles.sellOptionCard}>
          <View style={styles.sellOptionIcon}>
            <MaterialIcon name="camera-plus" size={32} color="#3B82F6" />
          </View>
          <View style={styles.sellOptionContent}>
            <Text style={styles.sellOptionTitle}>Sell an Item</Text>
            <Text style={styles.sellOptionSubtitle}>Post items for sale quickly</Text>
          </View>
          <Icon name="chevron-forward" size={24} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.sellOptionCard}>
          <View style={styles.sellOptionIcon}>
            <MaterialIcon name="store-plus" size={32} color="#8B5CF6" />
          </View>
          <View style={styles.sellOptionContent}>
            <Text style={styles.sellOptionTitle}>Become a Merchant</Text>
            <Text style={styles.sellOptionSubtitle}>Open your online shop</Text>
          </View>
          <Icon name="chevron-forward" size={24} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.sellOptionCard}>
          <View style={styles.sellOptionIcon}>
            <MaterialIcon name="truck-delivery" size={32} color="#10B981" />
          </View>
          <View style={styles.sellOptionContent}>
            <Text style={styles.sellOptionTitle}>Become a Shopper</Text>
            <Text style={styles.sellOptionSubtitle}>Get paid to shop & deliver</Text>
          </View>
          <Icon name="chevron-forward" size={24} color="#6B7280" />
        </TouchableOpacity>

        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsTitle}>Why Sell With Us?</Text>

          <View style={styles.benefitItem}>
            <Icon name="shield-checkmark" size={24} color="#10B981" />
            <Text style={styles.benefitText}>Secure payments & buyer protection</Text>
          </View>

          <View style={styles.benefitItem}>
            <Icon name="location" size={24} color="#3B82F6" />
            <Text style={styles.benefitText}>Real-time location tracking</Text>
          </View>

          <View style={styles.benefitItem}>
            <MaterialIcon name="cash-multiple" size={24} color="#F59E0B" />
            <Text style={styles.benefitText}>Low fees, fast payouts</Text>
          </View>

          <View style={styles.benefitItem}>
            <MaterialIcon name="robot" size={24} color="#8B5CF6" />
            <Text style={styles.benefitText}>AI-powered listing optimization</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderOrdersTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.ordersContainer}>
        <Text style={styles.sectionTitle}>Your Orders</Text>

        {/* Active Order with Live Tracking */}
        <View style={styles.activeOrderCard}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderStatus}>In Transit</Text>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Live Tracking</Text>
            </View>
          </View>

          <Text style={styles.orderTitle}>Fresh Organic Vegetables</Text>
          <Text style={styles.orderFrom}>From: Green Farms Market</Text>

          <TouchableOpacity style={styles.trackButton}>
            <MaterialIcon name="map-marker-path" size={20} color="#FFFFFF" />
            <Text style={styles.trackButtonText}>Track on Map</Text>
          </TouchableOpacity>

          <View style={styles.deliveryProgress}>
            <View style={styles.progressStep}>
              <Icon name="checkmark-circle" size={24} color="#10B981" />
              <Text style={styles.progressText}>Order Confirmed</Text>
            </View>
            <View style={styles.progressLine} />
            <View style={styles.progressStep}>
              <Icon name="checkmark-circle" size={24} color="#10B981" />
              <Text style={styles.progressText}>Picked Up</Text>
            </View>
            <View style={styles.progressLine} />
            <View style={styles.progressStep}>
              <View style={styles.activeProgressDot} />
              <Text style={[styles.progressText, styles.activeProgressText]}>In Transit</Text>
            </View>
            <View style={styles.progressLineInactive} />
            <View style={styles.progressStep}>
              <View style={styles.inactiveProgressDot} />
              <Text style={styles.progressTextInactive}>Delivered</Text>
            </View>
          </View>

          <View style={styles.deliveryETA}>
            <Icon name="time-outline" size={20} color="#6B7280" />
            <Text style={styles.etaText}>Estimated arrival in 15 minutes</Text>
          </View>
        </View>

        {/* Empty state for no orders */}
        <View style={styles.emptyOrders}>
          <MaterialIcon name="package-variant" size={64} color="#D1D5DB" />
          <Text style={styles.emptyOrdersText}>No other active orders</Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderDeliverTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.deliverContainer}>
        <View style={styles.deliverHeader}>
          <MaterialIcon name="bike-fast" size={48} color="#10B981" />
          <Text style={styles.deliverTitle}>Earn Money Shopping & Delivering</Text>
          <Text style={styles.deliverSubtitle}>
            Get paid to shop at local stores and deliver to nearby customers
          </Text>
        </View>

        {/* Earnings Card */}
        <View style={styles.earningsCard}>
          <Text style={styles.earningsLabel}>Today's Earnings</Text>
          <Text style={styles.earningsAmount}>$0.00</Text>
          <View style={styles.earningsStats}>
            <View style={styles.earningsStat}>
              <Text style={styles.earningsStatValue}>0</Text>
              <Text style={styles.earningsStatLabel}>Deliveries</Text>
            </View>
            <View style={styles.earningsStat}>
              <Text style={styles.earningsStatValue}>$0</Text>
              <Text style={styles.earningsStatLabel}>Tips</Text>
            </View>
            <View style={styles.earningsStat}>
              <Text style={styles.earningsStatValue}>0h</Text>
              <Text style={styles.earningsStatLabel}>Online</Text>
            </View>
          </View>
        </View>

        {/* Available Gigs */}
        <View style={styles.gigsSection}>
          <Text style={styles.sectionTitle}>Available Shopping Gigs</Text>

          {/* Gig 1 - High Reward - Premium Design */}
          {(() => {
            const reward = calculateGigReward(4, 12.50, 0); // 2.5 mi = ~4 km, $12.50 base pay, 0 mins = instant
            return (
              <View style={styles.premiumGigCard}>
                {/* Premium Gradient Background */}
                <LinearGradient
                  colors={['#7C3AED', '#6D28D9']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gigGradientHeader}
                >
                  <View style={styles.gigTopRow}>
                    <View style={styles.earningsContainer}>
                      <Text style={styles.earningsLabel}>Net Earnings</Text>
                      <Text style={styles.earningsAmountLarge}>${reward.netEarnings.toFixed(2)}</Text>
                      <Text style={styles.earningsSubtext}>after fuel costs</Text>
                    </View>
                    <View style={styles.instantBadge}>
                      <LinearGradient
                        colors={['#F472B6', '#EC4899']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.instantBadgeGradient}
                      >
                        <Icon name="flash" size={14} color="#FFFFFF" />
                        <Text style={styles.instantBadgeText}>INSTANT {reward.timeBonus}%</Text>
                      </LinearGradient>
                    </View>
                  </View>

                  <View style={styles.distanceRow}>
                    <Icon name="navigate" size={14} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.distanceText}>1.2 mi away • {reward.estimatedMinutes} min trip</Text>
                  </View>
                </LinearGradient>

                {/* Glass Morphism Content */}
                <View style={styles.gigContentSection}>
                  <Text style={styles.gigTitlePremium}>Grocery Shopping at Whole Foods</Text>
                  <Text style={styles.gigItemsPremium}>8 items • Contactless delivery</Text>

                  {/* Route with Icon */}
                  <View style={styles.routeCard}>
                    <View style={styles.routeIconContainer}>
                      <LinearGradient
                        colors={['#14B8A6', '#0D9488']}
                        style={styles.routeIconGradient}
                      >
                        <Icon name="location" size={16} color="#FFFFFF" />
                      </LinearGradient>
                    </View>
                    <View style={styles.routeDetails}>
                      <Text style={styles.routeLabel}>Route</Text>
                      <Text style={styles.routePath}>Whole Foods → Customer ({reward.distanceKm.toFixed(1)} km)</Text>
                    </View>
                  </View>

                  {/* Sophisticated Reward Breakdown */}
                  <View style={styles.rewardMetrics}>
                    <View style={styles.metricCard}>
                      <View style={styles.metricIconContainer}>
                        <MaterialIcon name="cash-multiple" size={20} color="#10B981" />
                      </View>
                      <Text style={styles.metricValue}>${reward.basePay.toFixed(2)}</Text>
                      <Text style={styles.metricLabel}>Base Pay</Text>
                    </View>

                    <View style={styles.metricDivider} />

                    <View style={styles.metricCard}>
                      <View style={styles.metricIconContainer}>
                        <MaterialIcon name="gas-station" size={20} color="#F472B6" />
                      </View>
                      <Text style={[styles.metricValue, { color: '#F472B6' }]}>-${reward.fuelCost.toFixed(2)}</Text>
                      <Text style={styles.metricLabel}>Fuel Cost</Text>
                    </View>

                    <View style={styles.metricDivider} />

                    <View style={styles.metricCard}>
                      <View style={styles.metricIconContainer}>
                        <Icon name="trending-up" size={20} color="#7C3AED" />
                      </View>
                      <Text style={[styles.metricValue, { color: '#7C3AED' }]}>{reward.timeBonus}%</Text>
                      <Text style={styles.metricLabel}>Bonus Rate</Text>
                    </View>
                  </View>

                  {/* Time Bonus Info Card */}
                  <View style={styles.bonusInfoCard}>
                    <LinearGradient
                      colors={['#FEF3C7', '#FDE68A']}
                      style={styles.bonusInfoGradient}
                    >
                      <Icon name="time" size={16} color="#92400E" />
                      <Text style={styles.bonusInfoText}>
                        Accept now = 100% • 10m = 95% • 30m = 90% • 1hr = 80%
                      </Text>
                    </LinearGradient>
                  </View>

                  {/* Premium Accept Button */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => Alert.alert(
                      'Gig Accepted!',
                      `You'll earn $${reward.netEarnings.toFixed(2)} after fuel costs.\n\nAccepted instantly = ${reward.timeBonus}% bonus!\n\nEstimated time: ${reward.estimatedMinutes} mins`,
                      [{ text: 'Start Shopping', style: 'default' }]
                    )}
                  >
                    <LinearGradient
                      colors={['#14B8A6', '#0D9488']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.premiumAcceptButton}
                    >
                      <Icon name="checkmark-circle" size={20} color="#FFFFFF" />
                      <Text style={styles.premiumAcceptText}>Accept Gig • Earn ${reward.netEarnings.toFixed(2)}</Text>
                      <Icon name="arrow-forward" size={18} color="#FFFFFF" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })()}

          {/* Gig 2 - Nearby Quick Gig - Premium Design */}
          {(() => {
            const reward = calculateGigReward(1.8, 8.00, 0); // 1.1 mi = ~1.8 km, $8.00 base pay
            return (
              <View style={styles.premiumGigCard}>
                {/* Teal Gradient for Nearby Gig */}
                <LinearGradient
                  colors={['#14B8A6', '#0D9488']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gigGradientHeader}
                >
                  <View style={styles.gigTopRow}>
                    <View style={styles.earningsContainer}>
                      <Text style={styles.earningsLabel}>Net Earnings</Text>
                      <Text style={styles.earningsAmountLarge}>${reward.netEarnings.toFixed(2)}</Text>
                      <Text style={styles.earningsSubtext}>after fuel costs</Text>
                    </View>
                    <View style={styles.instantBadge}>
                      <LinearGradient
                        colors={['#FCD34D', '#F59E0B']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.instantBadgeGradient}
                      >
                        <Icon name="location" size={14} color="#FFFFFF" />
                        <Text style={styles.instantBadgeText}>NEARBY</Text>
                      </LinearGradient>
                    </View>
                  </View>

                  <View style={styles.distanceRow}>
                    <Icon name="navigate" size={14} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.distanceText}>0.8 mi away • {reward.estimatedMinutes} min trip</Text>
                  </View>
                </LinearGradient>

                {/* Glass Morphism Content */}
                <View style={styles.gigContentSection}>
                  <Text style={styles.gigTitlePremium}>Pharmacy Pickup & Delivery</Text>
                  <Text style={styles.gigItemsPremium}>2 items • Quick & easy pickup</Text>

                  {/* Route with Icon */}
                  <View style={styles.routeCard}>
                    <View style={styles.routeIconContainer}>
                      <LinearGradient
                        colors={['#7C3AED', '#6D28D9']}
                        style={styles.routeIconGradient}
                      >
                        <Icon name="location" size={16} color="#FFFFFF" />
                      </LinearGradient>
                    </View>
                    <View style={styles.routeDetails}>
                      <Text style={styles.routeLabel}>Route</Text>
                      <Text style={styles.routePath}>CVS Pharmacy → Customer ({reward.distanceKm.toFixed(1)} km)</Text>
                    </View>
                  </View>

                  {/* Sophisticated Reward Breakdown */}
                  <View style={styles.rewardMetrics}>
                    <View style={styles.metricCard}>
                      <View style={styles.metricIconContainer}>
                        <MaterialIcon name="cash-multiple" size={20} color="#10B981" />
                      </View>
                      <Text style={styles.metricValue}>${reward.basePay.toFixed(2)}</Text>
                      <Text style={styles.metricLabel}>Base Pay</Text>
                    </View>

                    <View style={styles.metricDivider} />

                    <View style={styles.metricCard}>
                      <View style={styles.metricIconContainer}>
                        <MaterialIcon name="gas-station" size={20} color="#F472B6" />
                      </View>
                      <Text style={[styles.metricValue, { color: '#F472B6' }]}>-${reward.fuelCost.toFixed(2)}</Text>
                      <Text style={styles.metricLabel}>Fuel Cost</Text>
                    </View>

                    <View style={styles.metricDivider} />

                    <View style={styles.metricCard}>
                      <View style={styles.metricIconContainer}>
                        <Icon name="trending-up" size={20} color="#14B8A6" />
                      </View>
                      <Text style={[styles.metricValue, { color: '#14B8A6' }]}>{reward.timeBonus}%</Text>
                      <Text style={styles.metricLabel}>Bonus Rate</Text>
                    </View>
                  </View>

                  {/* Proximity Advantage Card */}
                  <View style={styles.bonusInfoCard}>
                    <LinearGradient
                      colors={['#D1FAE5', '#A7F3D0']}
                      style={styles.bonusInfoGradient}
                    >
                      <Icon name="flash" size={16} color="#065F46" />
                      <Text style={[styles.bonusInfoText, { color: '#065F46' }]}>
                        Close to you! Low fuel cost = Higher profit margin
                      </Text>
                    </LinearGradient>
                  </View>

                  {/* Premium Accept Button */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => Alert.alert(
                      'Gig Accepted!',
                      `You'll earn $${reward.netEarnings.toFixed(2)} after fuel costs.\n\nAccepted instantly = ${reward.timeBonus}% bonus!\n\nEstimated time: ${reward.estimatedMinutes} mins`,
                      [{ text: 'Start Shopping', style: 'default' }]
                    )}
                  >
                    <LinearGradient
                      colors={['#7C3AED', '#6D28D9']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.premiumAcceptButton}
                    >
                      <Icon name="checkmark-circle" size={20} color="#FFFFFF" />
                      <Text style={styles.premiumAcceptText}>Accept Gig • Earn ${reward.netEarnings.toFixed(2)}</Text>
                      <Icon name="arrow-forward" size={18} color="#FFFFFF" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })()}
        </View>

        {/* How it Works */}
        <View style={styles.howItWorksSection}>
          <Text style={styles.howItWorksTitle}>How It Works</Text>

          <View style={styles.howItWorksStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>Accept a shopping gig near you</Text>
          </View>

          <View style={styles.howItWorksStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>Shop at the store using the app's list</Text>
          </View>

          <View style={styles.howItWorksStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>Deliver to the customer with real-time tracking</Text>
          </View>

          <View style={styles.howItWorksStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <Text style={styles.stepText}>Get paid instantly + keep 100% of tips</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Marketplace</Text>
        <TouchableOpacity style={styles.cartButton}>
          <MaterialIcon name="cart-outline" size={24} color="#1F2937" />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>2</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      {activeTab === 'browse' && (
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Icon name="search" size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for items, shops, or use AI..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity>
              <MaterialIcon name="microphone" size={20} color="#3B82F6" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'browse' && styles.activeTab]}
          onPress={() => setActiveTab('browse')}
        >
          <MaterialIcon
            name="storefront-outline"
            size={20}
            color={activeTab === 'browse' ? '#3B82F6' : '#6B7280'}
          />
          <Text style={[styles.tabText, activeTab === 'browse' && styles.activeTabText]}>
            Browse
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'sell' && styles.activeTab]}
          onPress={() => setActiveTab('sell')}
        >
          <MaterialIcon
            name="tag-plus"
            size={20}
            color={activeTab === 'sell' ? '#3B82F6' : '#6B7280'}
          />
          <Text style={[styles.tabText, activeTab === 'sell' && styles.activeTabText]}>
            Sell
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'orders' && styles.activeTab]}
          onPress={() => setActiveTab('orders')}
        >
          <MaterialIcon
            name="package-variant"
            size={20}
            color={activeTab === 'orders' ? '#3B82F6' : '#6B7280'}
          />
          <Text style={[styles.tabText, activeTab === 'orders' && styles.activeTabText]}>
            Orders
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'deliver' && styles.activeTab]}
          onPress={() => setActiveTab('deliver')}
        >
          <MaterialIcon
            name="bike-fast"
            size={20}
            color={activeTab === 'deliver' ? '#3B82F6' : '#6B7280'}
          />
          <Text style={[styles.tabText, activeTab === 'deliver' && styles.activeTabText]}>
            Deliver
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'browse' && renderBrowseTab()}
      {activeTab === 'sell' && renderSellTab()}
      {activeTab === 'orders' && renderOrdersTab()}
      {activeTab === 'deliver' && renderDeliverTab()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#1F2937',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
  },
  // Premium AI Assistant Card
  premiumAICard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#9333EA',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  aiGradientContainer: {
    padding: 20,
  },
  aiContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiIconBox: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  aiIconGradient: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTextContent: {
    flex: 1,
    marginLeft: 16,
  },
  aiTitlePremium: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  aiSubtitlePremium: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },
  aiArrowContainer: {
    marginLeft: 8,
  },
  aiAssistantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 16,
  },
  aiIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  aiSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  categoriesContainer: {
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    paddingHorizontal: 16,
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  categoriesScroll: {
    paddingLeft: 16,
  },
  // Premium Category Cards
  categoryCardPremium: {
    alignItems: 'center',
    marginRight: 16,
  },
  categoryIconPremium: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  categoryTextPremium: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: 16,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  itemsContainer: {
    paddingTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  // Premium Product Card Styles
  premiumItemCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  itemImageContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
  },
  itemImagePremium: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F1F5F9',
  },
  promotionBadgeContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  promotionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  promotionText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  promotionSubtext: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  itemDetailsPremium: {
    padding: 16,
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemTitlePremium: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: 0.2,
    lineHeight: 22,
  },
  itemRatingPremium: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 3,
    marginLeft: 8,
  },
  ratingTextPremium: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
  itemMetaPremium: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  itemLocationPremium: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
  },
  distancePill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  distanceTextPill: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  itemFooterPremium: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  originalPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    textDecorationColor: '#94A3B8',
  },
  itemPricePremium: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  deliveryBadgePremium: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  deliveryBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },
  deliveryTextPremium: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
    letterSpacing: 0.3,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemLocation: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  itemDistance: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  itemRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  deliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 4,
  },
  deliveryText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '600',
  },
  sellContainer: {
    padding: 16,
  },
  sellHeader: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  sellTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  sellSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  sellOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sellOptionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellOptionContent: {
    flex: 1,
    marginLeft: 12,
  },
  sellOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  sellOptionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  benefitsSection: {
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  ordersContainer: {
    padding: 16,
  },
  activeOrderCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  liveText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  orderFrom: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  trackButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deliveryProgress: {
    marginBottom: 12,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressText: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '500',
  },
  activeProgressText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  progressTextInactive: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  progressLine: {
    width: 2,
    height: 20,
    backgroundColor: '#10B981',
    marginLeft: 12,
  },
  progressLineInactive: {
    width: 2,
    height: 20,
    backgroundColor: '#E5E7EB',
    marginLeft: 12,
  },
  activeProgressDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    borderWidth: 3,
    borderColor: '#DBEAFE',
  },
  inactiveProgressDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  deliveryETA: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  etaText: {
    fontSize: 13,
    color: '#92400E',
    fontWeight: '600',
  },
  emptyOrders: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyOrdersText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
  },
  deliverContainer: {
    padding: 16,
  },
  deliverHeader: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  deliverTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  deliverSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  earningsCard: {
    backgroundColor: '#10B981',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  earningsLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  earningsAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  earningsStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  earningsStat: {
    alignItems: 'center',
  },
  earningsStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  earningsStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  gigsSection: {
    marginBottom: 24,
  },
  // Premium Gig Card Styles
  premiumGigCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  gigGradientHeader: {
    padding: 20,
    paddingBottom: 24,
  },
  gigTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  earningsContainer: {
    flex: 1,
  },
  earningsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  earningsAmountLarge: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: 2,
  },
  earningsSubtext: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  instantBadge: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  instantBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  instantBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  distanceText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  gigContentSection: {
    padding: 20,
  },
  gigTitlePremium: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  gigItemsPremium: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
    fontWeight: '500',
  },
  routeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  routeIconContainer: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  routeIconGradient: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeDetails: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  routePath: {
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '600',
  },
  rewardMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    alignItems: 'center',
  },
  metricIconContainer: {
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#10B981',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  metricDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  bonusInfoCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  bonusInfoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  bonusInfoText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: '#92400E',
    lineHeight: 16,
  },
  premiumAcceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  premiumAcceptText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  gigCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  gigHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  gigPay: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 4,
  },
  gigDistance: {
    fontSize: 12,
    color: '#6B7280',
  },
  gigUrgent: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gigUrgentText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#EF4444',
  },
  gigTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  gigItems: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  gigRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    gap: 6,
  },
  gigRouteText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  fastAcceptBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  fastAcceptText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F59E0B',
  },
  rewardBreakdown: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 12,
  },
  rewardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rewardLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  rewardValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
  },
  rewardValueNegative: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
  },
  timeBonusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 6,
    gap: 6,
  },
  timeBonusText: {
    fontSize: 11,
    color: '#92400E',
    fontWeight: '600',
    flex: 1,
  },
  proximityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    padding: 8,
    borderRadius: 6,
    gap: 6,
  },
  proximityText: {
    fontSize: 11,
    color: '#1E40AF',
    fontWeight: '600',
    flex: 1,
  },
  acceptButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  howItWorksSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  howItWorksTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  howItWorksStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
    paddingTop: 6,
  },
});
