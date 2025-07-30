const moment = require('moment');

class ProrationService {
  /**
   * Calculate proration amount for plan changes
   * @param {Object} currentPlan - Current subscription plan
   * @param {Object} newPlan - New plan to change to
   * @param {Date} changeDate - Date of the plan change
   * @param {Date} currentPeriodStart - Start date of current billing period
   * @param {Date} currentPeriodEnd - End date of current billing period
   * @returns {Object} Proration calculation details
   */
  static calculateProration(currentPlan, newPlan, changeDate = new Date(), currentPeriodStart, currentPeriodEnd) {
    const changeMoment = moment(changeDate);
    const periodStart = moment(currentPeriodStart);
    const periodEnd = moment(currentPeriodEnd);
    
    // Calculate total days in current billing period
    const totalDaysInPeriod = periodEnd.diff(periodStart, 'days') + 1;
    
    // Calculate days used in current period (from period start to change date)
    const daysUsed = changeMoment.diff(periodStart, 'days');
    
    // Calculate remaining days in current period (from change date to period end)
    const daysRemaining = periodEnd.diff(changeMoment, 'days') + 1;
    
    // Calculate daily rates
    const currentPlanDailyRate = parseFloat(currentPlan.price) / totalDaysInPeriod;
    const newPlanDailyRate = parseFloat(newPlan.price) / totalDaysInPeriod;
    
    // Calculate credits and charges
    const creditForUnusedDays = currentPlanDailyRate * daysRemaining;
    const chargeForNewPlanRemainingDays = newPlanDailyRate * daysRemaining;
    
    // Calculate the immediate charge (can be positive for upgrade, negative for downgrade)
    const immediateCharge = chargeForNewPlanRemainingDays - creditForUnusedDays;
    
    // Round to 2 decimal places
    const roundedImmediate = Math.round(immediateCharge * 100) / 100;
    
    return {
      changeDate: changeMoment.format('YYYY-MM-DD'),
      currentPeriod: {
        start: periodStart.format('YYYY-MM-DD'),
        end: periodEnd.format('YYYY-MM-DD'),
        totalDays: totalDaysInPeriod
      },
      usage: {
        daysUsed,
        daysRemaining
      },
      currentPlan: {
        name: currentPlan.name,
        monthlyPrice: parseFloat(currentPlan.price),
        dailyRate: Math.round(currentPlanDailyRate * 100) / 100,
        creditForUnusedDays: Math.round(creditForUnusedDays * 100) / 100
      },
      newPlan: {
        name: newPlan.name,
        monthlyPrice: parseFloat(newPlan.price),
        dailyRate: Math.round(newPlanDailyRate * 100) / 100,
        chargeForRemainingDays: Math.round(chargeForNewPlanRemainingDays * 100) / 100
      },
      proration: {
        immediateCharge: roundedImmediate,
        isUpgrade: immediateCharge > 0,
        isDowngrade: immediateCharge < 0,
        nextBillingAmount: parseFloat(newPlan.price), // Full amount starting next period
        nextBillingDate: periodEnd.clone().add(1, 'day').format('YYYY-MM-DD')
      },
      summary: {
        description: this.generateProrationDescription(
          currentPlan.name, 
          newPlan.name, 
          roundedImmediate, 
          daysRemaining,
          periodEnd.format('YYYY-MM-DD')
        )
      }
    };
  }
  
  /**
   * Generate human-readable description of the proration
   */
  static generateProrationDescription(currentPlanName, newPlanName, immediateCharge, daysRemaining, periodEnd) {
    const isUpgrade = immediateCharge > 0;
    const isDowngrade = immediateCharge < 0;
    const amount = Math.abs(immediateCharge);
    
    if (isUpgrade) {
      return `Upgrade de ${currentPlanName} a ${newPlanName}. Se cobrará $${amount.toLocaleString('es-CL')} inmediatamente por los ${daysRemaining} días restantes hasta el ${periodEnd}. A partir del próximo período se cobrará el precio completo del plan ${newPlanName}.`;
    } else if (isDowngrade) {
      return `Downgrade de ${currentPlanName} a ${newPlanName}. Se aplicará un crédito de $${amount.toLocaleString('es-CL')} por los ${daysRemaining} días restantes hasta el ${periodEnd}. A partir del próximo período se cobrará el precio completo del plan ${newPlanName}.`;
    } else {
      return `No hay cargo adicional para el cambio de ${currentPlanName} a ${newPlanName}.`;
    }
  }
  
  /**
   * Calculate next billing date based on current subscription
   */
  static calculateNextBillingDate(currentSubscription) {
    if (!currentSubscription.next_payment_date) {
      // If no next payment date, assume monthly billing from subscription start
      const startDate = moment(currentSubscription.start_date);
      return startDate.add(1, 'month').format('YYYY-MM-DD');
    }
    
    return moment(currentSubscription.next_payment_date).format('YYYY-MM-DD');
  }
  
  /**
   * Get current billing period for a subscription
   */
  static getCurrentBillingPeriod(subscription) {
    const now = moment();
    let periodStart, periodEnd;
    
    if (subscription.start_date && subscription.next_payment_date) {
      // Use existing dates
      periodStart = moment(subscription.start_date);
      periodEnd = moment(subscription.next_payment_date).subtract(1, 'day');
    } else {
      // Assume monthly billing starting from subscription start date
      const startDate = moment(subscription.start_date || subscription.created_at);
      const dayOfMonth = startDate.date();
      
      // Find the current period
      periodStart = moment().date(dayOfMonth);
      if (periodStart.isAfter(now)) {
        periodStart.subtract(1, 'month');
      }
      
      periodEnd = periodStart.clone().add(1, 'month').subtract(1, 'day');
    }
    
    return {
      start: periodStart.toDate(),
      end: periodEnd.toDate()
    };
  }
}

module.exports = ProrationService;