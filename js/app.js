// =============================================
//   FitTrack - Health & Fitness Tracker
//   Author: Shubham Shivaji Kondikire
//   Intern ID: CITS1700
//   Project: Internship Project 2
// =============================================

// ---- STATE ----
let workouts   = JSON.parse(localStorage.getItem('fittrack_workouts'))   || [];
let nutrition  = JSON.parse(localStorage.getItem('fittrack_nutrition'))  || [];
let waterCount = parseInt(localStorage.getItem('fittrack_water'))        || 0;
let goals      = JSON.parse(localStorage.getItem('fittrack_goals'))      || {};
let weeklyChart;

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  setTodayDate();
  setupNavigation();
  setDefaultDates();
  initWeeklyChart();
  updateDashboard();
  renderNutritionLog();
  renderWorkoutHistory();
  updateWaterUI();
  renderGoalsProgress();
});

// ---- NAVIGATION ----
function setupNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      const section = this.getAttribute('data-section');
      if (!section) return;
      // Hide all sections
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.getElementById(section).classList.add('active');
      // Update nav
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      this.classList.add('active');
      // Update title
      const titles = {
        dashboard: ['Dashboard', 'Your daily health overview'],
        workout:   ['Log Workout', 'Track your exercise'],
        nutrition: ['Nutrition', 'Track your meals'],
        water:     ['Water Intake', 'Stay hydrated'],
        goals:     ['Goals', 'Set your fitness targets'],
        history:   ['History', 'All your workout logs']
      };
      document.getElementById('page-title').textContent = titles[section][0];
      document.getElementById('page-sub').textContent   = titles[section][1];
      // Refresh data
      if (section === 'dashboard') updateDashboard();
      if (section === 'history')   renderWorkoutHistory();
      if (section === 'nutrition') renderNutritionLog();
      if (section === 'goals')     renderGoalsProgress();
    });
  });
}

// ---- DATE HELPERS ----
function setTodayDate() {
  const now = new Date();
  document.getElementById('today-date').textContent =
    now.toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'long', year:'numeric' });
}

function setDefaultDates() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('w-date').value = today;
  document.getElementById('n-date').value = today;
}

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

// ---- SAVE ----
function saveData() {
  localStorage.setItem('fittrack_workouts',  JSON.stringify(workouts));
  localStorage.setItem('fittrack_nutrition', JSON.stringify(nutrition));
  localStorage.setItem('fittrack_water',     waterCount);
  localStorage.setItem('fittrack_goals',     JSON.stringify(goals));
}

// ---- LOG WORKOUT ----
function logWorkout() {
  const type      = document.getElementById('w-type').value;
  const duration  = parseInt(document.getElementById('w-duration').value);
  const calories  = parseInt(document.getElementById('w-calories').value);
  const steps     = parseInt(document.getElementById('w-steps').value) || 0;
  const date      = document.getElementById('w-date').value;
  const intensity = document.getElementById('w-intensity').value;
  const notes     = document.getElementById('w-notes').value.trim();

  if (!type || !duration || !calories || !date) {
    showFormMsg('workout-msg', 'Please fill all required fields!', 'error');
    return;
  }

  const workout = {
    id: Date.now(),
    type, duration, calories, steps, date, intensity, notes,
    time: new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })
  };

  workouts.unshift(workout);
  saveData();
  showFormMsg('workout-msg', `✅ ${type} workout logged! ${calories} kcal burned.`, 'success');
  resetWorkoutForm();
  updateDashboard();
  showToast('Workout saved!', 'success');
}

function resetWorkoutForm() {
  document.getElementById('w-type').value      = '';
  document.getElementById('w-duration').value  = '';
  document.getElementById('w-calories').value  = '';
  document.getElementById('w-steps').value     = '';
  document.getElementById('w-notes').value     = '';
  document.getElementById('w-intensity').value = 'Medium';
  document.getElementById('w-date').value = getTodayStr();
}

// ---- LOG NUTRITION ----
function logNutrition() {
  const meal     = document.getElementById('n-meal').value;
  const food     = document.getElementById('n-food').value.trim();
  const calories = parseInt(document.getElementById('n-calories').value);
  const protein  = parseInt(document.getElementById('n-protein').value) || 0;
  const carbs    = parseInt(document.getElementById('n-carbs').value)   || 0;
  const date     = document.getElementById('n-date').value;

  if (!food || !calories || !date) {
    showFormMsg('nutrition-msg', 'Please fill all required fields!', 'error');
    return;
  }

  const entry = { id: Date.now(), meal, food, calories, protein, carbs, date };
  nutrition.unshift(entry);
  saveData();
  showFormMsg('nutrition-msg', `✅ ${meal} logged! ${calories} kcal.`, 'success');
  resetNutritionForm();
  renderNutritionLog();
  showToast('Meal saved!', 'success');
}

function resetNutritionForm() {
  document.getElementById('n-food').value     = '';
  document.getElementById('n-calories').value = '';
  document.getElementById('n-protein').value  = '';
  document.getElementById('n-carbs').value    = '';
  document.getElementById('n-date').value = getTodayStr();
}

// ---- WATER ----
function addWater() {
  if (waterCount >= 8) { showToast('Daily goal reached! 🎉', 'info'); return; }
  waterCount++;
  saveData();
  updateWaterUI();
  if (waterCount === 8) showToast('🎉 Daily water goal achieved!', 'success');
  else showToast(`Glass added! ${waterCount}/8 💧`, 'info');
}

function removeWater() {
  if (waterCount <= 0) return;
  waterCount--;
  saveData();
  updateWaterUI();
}

function updateWaterUI() {
  const percent = (waterCount / 8) * 100;
  document.getElementById('water-fill').style.height    = percent + '%';
  document.getElementById('water-text').textContent     = `${waterCount}/8`;
  document.getElementById('water-count').textContent    = `${waterCount} glasses today`;
  document.getElementById('water-progress-fill').style.width = percent + '%';
  document.getElementById('water-progress-text').textContent = `${Math.round(percent)}% of daily goal`;
  document.getElementById('dash-water').textContent = waterCount;
}

// ---- GOALS ----
function saveGoals() {
  goals.steps    = parseInt(document.getElementById('g-steps').value)    || 10000;
  goals.calories = parseInt(document.getElementById('g-calories').value) || 500;
  goals.workouts = parseInt(document.getElementById('g-workouts').value) || 5;
  goals.weight   = parseFloat(document.getElementById('g-weight').value) || 0;
  saveData();
  showFormMsg('goals-msg', '✅ Goals saved successfully!', 'success');
  renderGoalsProgress();
  showToast('Goals updated!', 'success');
}

function renderGoalsProgress() {
  const container = document.getElementById('goals-progress');
  if (!goals.steps) {
    container.innerHTML = '<p style="color:var(--muted);font-size:14px;padding:16px;">No goals set yet. Set your goals above!</p>';
    return;
  }

  // Calculate today's stats
  const today    = getTodayStr();
  const todayCal = workouts.filter(w => w.date === today).reduce((s, w) => s + w.calories, 0);
  const todayStp = workouts.filter(w => w.date === today).reduce((s, w) => s + w.steps, 0);
  const weekWkt  = getThisWeekWorkouts().length;

  const items = [
    { label: '👣 Daily Steps', current: todayStp,    target: goals.steps,    unit: 'steps' },
    { label: '🔥 Calories Burned', current: todayCal, target: goals.calories, unit: 'kcal' },
    { label: '🏋️ Weekly Workouts', current: weekWkt,  target: goals.workouts, unit: 'workouts' },
  ];

  container.innerHTML = `
    <h3 style="margin-bottom:16px;">📊 Goals Progress</h3>
    <div class="goals-grid">
      ${items.map(item => {
        const pct = Math.min((item.current / item.target) * 100, 100).toFixed(0);
        const color = pct >= 100 ? 'var(--green)' : pct >= 60 ? '#f59e0b' : 'var(--accent)';
        return `
          <div class="goal-item">
            <div class="goal-label">${item.label}</div>
            <div class="goal-value" style="color:${color}">${item.current} / ${item.target} ${item.unit}</div>
            <div class="progress-bar" style="margin-top:8px;">
              <div style="height:100%;width:${pct}%;background:${color};border-radius:4px;transition:width 0.4s;"></div>
            </div>
            <div style="font-size:12px;color:var(--muted);margin-top:4px;">${pct}% complete</div>
          </div>
        `;
      }).join('')}
      ${goals.weight ? `
        <div class="goal-item">
          <div class="goal-label">⚖️ Target Weight</div>
          <div class="goal-value" style="color:var(--purple)">${goals.weight} kg</div>
          <div style="font-size:12px;color:var(--muted);margin-top:4px;">Keep tracking your progress!</div>
        </div>
      ` : ''}
    </div>
  `;
}

// ---- DASHBOARD ----
function updateDashboard() {
  const today = getTodayStr();

  // Today's calories burned
  const todayCal = workouts.filter(w => w.date === today).reduce((s,w) => s + w.calories, 0);
  document.getElementById('dash-calories').textContent = todayCal;

  // Today's steps
  const todaySteps = workouts.filter(w => w.date === today).reduce((s,w) => s + w.steps, 0);
  document.getElementById('dash-steps').textContent = todaySteps.toLocaleString('en-IN');

  // This week workouts
  document.getElementById('dash-workouts').textContent = getThisWeekWorkouts().length;

  // Today's activity log
  renderTodayLog(today);
  updateWeeklyChart();
}

function renderTodayLog(today) {
  const tbody   = document.getElementById('today-log');
  const todayWk = workouts.filter(w => w.date === today);

  if (todayWk.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="empty">No activities logged today.</td></tr>`;
    return;
  }

  tbody.innerHTML = todayWk.map(w => `
    <tr>
      <td>${w.time || '—'}</td>
      <td>${getExerciseEmoji(w.type)} ${w.type}</td>
      <td>${w.duration} min</td>
      <td>🔥 ${w.calories} kcal</td>
    </tr>
  `).join('');
}

// ---- WORKOUT HISTORY ----
function renderWorkoutHistory() {
  const tbody = document.getElementById('workout-history');

  if (workouts.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty">No workouts logged yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = workouts.map(w => `
    <tr>
      <td>${formatDate(w.date)}</td>
      <td>${getExerciseEmoji(w.type)} ${w.type}</td>
      <td>${w.duration} min</td>
      <td>🔥 ${w.calories} kcal</td>
      <td><span class="badge badge-${w.intensity.toLowerCase()}">${w.intensity}</span></td>
      <td><button class="delete-btn" onclick="deleteWorkout(${w.id})">🗑️</button></td>
    </tr>
  `).join('');
}

function deleteWorkout(id) {
  if (!confirm('Delete this workout?')) return;
  workouts = workouts.filter(w => w.id !== id);
  saveData();
  renderWorkoutHistory();
  updateDashboard();
  showToast('Workout deleted.', 'info');
}

function clearWorkouts() {
  if (!confirm('Clear all workout history?')) return;
  workouts = [];
  saveData();
  renderWorkoutHistory();
  updateDashboard();
  showToast('History cleared.', 'info');
}

// ---- NUTRITION LOG ----
function renderNutritionLog() {
  const today  = getTodayStr();
  const tbody  = document.getElementById('nutrition-log');
  const todayN = nutrition.filter(n => n.date === today);

  // Update summary
  const totalCal     = todayN.reduce((s,n) => s + n.calories, 0);
  const totalProtein = todayN.reduce((s,n) => s + n.protein, 0);
  const totalCarbs   = todayN.reduce((s,n) => s + n.carbs, 0);

  document.getElementById('n-total-cal').textContent     = totalCal;
  document.getElementById('n-total-protein').textContent = totalProtein + 'g';
  document.getElementById('n-total-carbs').textContent   = totalCarbs + 'g';

  if (todayN.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty">No meals logged today.</td></tr>`;
    return;
  }

  tbody.innerHTML = todayN.map(n => `
    <tr>
      <td>${getMealEmoji(n.meal)} ${n.meal}</td>
      <td>${n.food}</td>
      <td>${n.calories} kcal</td>
      <td>${n.protein}g</td>
      <td>${n.carbs}g</td>
      <td><button class="delete-btn" onclick="deleteNutrition(${n.id})">🗑️</button></td>
    </tr>
  `).join('');
}

function deleteNutrition(id) {
  nutrition = nutrition.filter(n => n.id !== id);
  saveData();
  renderNutritionLog();
  showToast('Meal deleted.', 'info');
}

// ---- BMI CALCULATOR ----
function calculateBMI() {
  const height = parseFloat(document.getElementById('bmi-height').value);
  const weight = parseFloat(document.getElementById('bmi-weight').value);

  if (!height || !weight || height <= 0 || weight <= 0) {
    showToast('Enter valid height and weight!', 'error');
    return;
  }

  const heightM = height / 100;
  const bmi     = (weight / (heightM * heightM)).toFixed(1);

  let category, color, tip, fillWidth;

  if (bmi < 18.5) {
    category = 'Underweight'; color = '#3b82f6';
    tip = 'You may need to increase calorie intake. Consult a doctor.';
    fillWidth = '20%';
  } else if (bmi < 25) {
    category = 'Normal Weight ✅'; color = '#22c55e';
    tip = 'Great! Maintain your current healthy lifestyle.';
    fillWidth = '50%';
  } else if (bmi < 30) {
    category = 'Overweight'; color = '#f59e0b';
    tip = 'Consider more physical activity and a balanced diet.';
    fillWidth = '75%';
  } else {
    category = 'Obese'; color = '#ef4444';
    tip = 'Please consult a healthcare professional for guidance.';
    fillWidth = '100%';
  }

  document.getElementById('bmi-score').textContent        = bmi;
  document.getElementById('bmi-score').style.color        = color;
  document.getElementById('bmi-category').textContent     = category;
  document.getElementById('bmi-category').style.color     = color;
  document.getElementById('bmi-fill').style.width         = fillWidth;
  document.getElementById('bmi-fill').style.background    = color;
  document.getElementById('bmi-tip').textContent          = tip;
  document.getElementById('bmi-result').style.display     = 'block';
}

// ---- WEEKLY CHART ----
function initWeeklyChart() {
  const ctx = document.getElementById('weeklyChart').getContext('2d');
  weeklyChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
      datasets: [{
        label: 'Calories Burned',
        data: [0,0,0,0,0,0,0],
        backgroundColor: 'rgba(99,102,241,0.6)',
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#6b7280' } } },
      scales: {
        x: { ticks: { color: '#6b7280' }, grid: { color: 'rgba(255,255,255,0.04)' } },
        y: { ticks: { color: '#6b7280' }, grid: { color: 'rgba(255,255,255,0.04)' } }
      }
    }
  });
  updateWeeklyChart();
}

function updateWeeklyChart() {
  const days   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const today  = new Date();
  const labels = [];
  const data   = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split('T')[0];
    labels.push(days[d.getDay()]);
    const dayCal = workouts.filter(w => w.date === key).reduce((s,w) => s + w.calories, 0);
    data.push(dayCal);
  }

  weeklyChart.data.labels             = labels;
  weeklyChart.data.datasets[0].data   = data;
  weeklyChart.update();
}

// ---- HELPERS ----
function getThisWeekWorkouts() {
  const now   = new Date();
  const day   = now.getDay();
  const start = new Date(now);
  start.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  start.setHours(0,0,0,0);
  return workouts.filter(w => new Date(w.date) >= start);
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
}

function getExerciseEmoji(type) {
  const map = {
    Running:'🏃', Walking:'🚶', Cycling:'🚴', Swimming:'🏊',
    Gym:'🏋️', Yoga:'🧘', HIIT:'⚡', Football:'⚽', Cricket:'🏏', Other:'🤸'
  };
  return map[type] || '🏃';
}

function getMealEmoji(meal) {
  const map = { Breakfast:'🌅', Lunch:'☀️', Dinner:'🌙', Snack:'🍎' };
  return map[meal] || '🍽️';
}

function showFormMsg(id, msg, type) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.className = `form-msg ${type}`;
  setTimeout(() => { el.className = 'form-msg'; el.textContent = ''; }, 3000);
}

function showToast(msg, type = 'info') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast ${type} show`;
  setTimeout(() => { t.className = 'toast'; }, 3000);
}
