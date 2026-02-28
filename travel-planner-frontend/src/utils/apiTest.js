import authAPI from '../api/auth';
import tripsAPI from '../api/trips';
import destinationsAPI from '../api/destinations';
import activitiesAPI from '../api/activities';
import budgetsAPI from '../api/budgets';
import bookingsAPI from '../api/bookings';
import notificationsAPI from '../api/notifications';
import weatherAPI from '../api/weather';
import recommendationsAPI from '../api/recommendations';

export const testAPIIntegration = async () => {
  const results = [];
  
  // Test 1: Authentication
  try {
    console.log('🔐 Testing Authentication APIs...');
    
    // Test login
    const loginRes = await authAPI.login({
      email: 'testuser@example.com',
      password: 'Test@123'
    });
    console.log('✅ Login successful:', loginRes.data);
    results.push({ api: 'Auth Login', status: '✅ PASS' });
    
    // Store token
    localStorage.setItem('token', loginRes.data.token);
    
    // Test get profile
    const profileRes = await authAPI.getProfile();
    console.log('✅ Get profile successful:', profileRes.data);
    results.push({ api: 'Get Profile', status: '✅ PASS' });
    
  } catch (error) {
    console.error('❌ Auth API failed:', error.message);
    results.push({ api: 'Auth APIs', status: '❌ FAIL', error: error.message });
  }
  
  // Test 2: Trips
  try {
    console.log('\n✈️ Testing Trip APIs...');
    
    // Create trip
    const createRes = await tripsAPI.createTrip({
      title: 'Test Trip',
      description: 'Integration test trip',
      startDate: '2024-07-15',
      endDate: '2024-07-22',
      isPublic: false
    });
    console.log('✅ Create trip successful:', createRes.data);
    results.push({ api: 'Create Trip', status: '✅ PASS' });
    
    const tripId = createRes.data.id;
    
    // Get all trips
    const allTrips = await tripsAPI.getAllTrips();
    console.log('✅ Get all trips successful:', allTrips.data);
    results.push({ api: 'Get All Trips', status: '✅ PASS' });
    
    // Get single trip
    const singleTrip = await tripsAPI.getTrip(tripId);
    console.log('✅ Get single trip successful:', singleTrip.data);
    results.push({ api: 'Get Single Trip', status: '✅ PASS' });
    
    // Update trip
    const updateRes = await tripsAPI.updateTrip(tripId, {
      title: 'Updated Test Trip',
      description: 'Updated description'
    });
    console.log('✅ Update trip successful:', updateRes.data);
    results.push({ api: 'Update Trip', status: '✅ PASS' });
    
  } catch (error) {
    console.error('❌ Trip APIs failed:', error.message);
    results.push({ api: 'Trip APIs', status: '❌ FAIL', error: error.message });
  }
  
  // Test 3: Destinations
  try {
    console.log('\n📍 Testing Destination APIs...');
    
    // First get a trip ID (assuming you have one)
    const trips = await tripsAPI.getAllTrips();
    if (trips.data?.length > 0) {
      const tripId = trips.data[0].id;
      
      // Add destination
      const destRes = await destinationsAPI.addDestination(tripId, {
        name: 'Paris',
        country: 'France',
        city: 'Paris',
        arrivalDate: '2024-07-15',
        departureDate: '2024-07-22',
        notes: 'Integration test destination'
      });
      console.log('✅ Add destination successful:', destRes.data);
      results.push({ api: 'Add Destination', status: '✅ PASS' });
      
      // Get destinations
      const destinations = await destinationsAPI.getDestinations(tripId);
      console.log('✅ Get destinations successful:', destinations.data);
      results.push({ api: 'Get Destinations', status: '✅ PASS' });
    }
    
  } catch (error) {
    console.error('❌ Destination APIs failed:', error.message);
    results.push({ api: 'Destination APIs', status: '❌ FAIL', error: error.message });
  }
  
  // Test 4: Budget
  try {
    console.log('\n💰 Testing Budget APIs...');
    
    const trips = await tripsAPI.getAllTrips();
    if (trips.data?.length > 0) {
      const tripId = trips.data[0].id;
      
      // Create budget
      const budgetRes = await budgetsAPI.createBudget(tripId, {
        totalBudget: 5000,
        currency: 'USD',
        notes: 'Test budget'
      });
      console.log('✅ Create budget successful:', budgetRes.data);
      results.push({ api: 'Create Budget', status: '✅ PASS' });
      
      // Get budget
      const budget = await budgetsAPI.getBudget(tripId);
      console.log('✅ Get budget successful:', budget.data);
      results.push({ api: 'Get Budget', status: '✅ PASS' });
      
      // Add expense
      const expenseRes = await budgetsAPI.addExpense(tripId, {
        category: 'FOOD',
        description: 'Test expense',
        estimatedAmount: 150,
        actualAmount: 180,
        currency: 'USD',
        expenseDate: '2024-07-16'
      });
      console.log('✅ Add expense successful:', expenseRes.data);
      results.push({ api: 'Add Expense', status: '✅ PASS' });
      
      // Get expenses
      const expenses = await budgetsAPI.getExpenses(tripId);
      console.log('✅ Get expenses successful:', expenses.data);
      results.push({ api: 'Get Expenses', status: '✅ PASS' });
      
      // Get summary
      const summary = await budgetsAPI.getBudgetSummary(tripId);
      console.log('✅ Get budget summary successful:', summary.data);
      results.push({ api: 'Budget Summary', status: '✅ PASS' });
    }
    
  } catch (error) {
    console.error('❌ Budget APIs failed:', error.message);
    results.push({ api: 'Budget APIs', status: '❌ FAIL', error: error.message });
  }
  
  // Test 5: Weather
  try {
    console.log('\n☀️ Testing Weather APIs...');
    
    const weather = await weatherAPI.getCurrentWeather('Paris');
    console.log('✅ Get weather successful:', weather);
    results.push({ api: 'Weather API', status: '✅ PASS' });
    
  } catch (error) {
    console.error('❌ Weather API failed:', error.message);
    results.push({ api: 'Weather API', status: '❌ FAIL', error: error.message });
  }
  
  // Test 6: Notifications
  try {
    console.log('\n🔔 Testing Notification APIs...');
    
    const prefs = await notificationsAPI.getPreferences();
    console.log('✅ Get preferences successful:', prefs);
    results.push({ api: 'Notification Preferences', status: '✅ PASS' });
    
    const count = await notificationsAPI.getUnreadCount();
    console.log('✅ Get unread count successful:', count);
    results.push({ api: 'Unread Count', status: '✅ PASS' });
    
  } catch (error) {
    console.error('❌ Notification APIs failed:', error.message);
    results.push({ api: 'Notification APIs', status: '❌ FAIL', error: error.message });
  }
  
  // Print summary
  console.log('\n📊 ========== INTEGRATION TEST SUMMARY ==========');
  results.forEach(r => {
    console.log(`${r.status} ${r.api}`);
    if (r.error) console.log(`   Error: ${r.error}`);
  });
  
  const passed = results.filter(r => r.status === '✅ PASS').length;
  const failed = results.filter(r => r.status === '❌ FAIL').length;
  console.log(`\n✅ Passed: ${passed} | ❌ Failed: ${failed} | Total: ${results.length}`);
  
  return results;
};