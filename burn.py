# Startup Burn Rate & Runway Calculator

class StartupFinance:
    def __init__(self, name, cash_in_hand, monthly_expenses, monthly_revenue):
        self.name = name
        self.cash_in_hand = cash_in_hand
        self.monthly_expenses = monthly_expenses
        self.monthly_revenue = monthly_revenue

    def burn_rate(self):
        return self.monthly_expenses - self.monthly_revenue

    def runway_months(self):
        burn = self.burn_rate()
        if burn <= 0:
            return "Profitable 🚀"
        return round(self.cash_in_hand / burn, 1)

    def advice(self):
        burn = self.burn_rate()
        if burn <= 0:
            return "Startup is profitable. Focus on scaling."
        elif burn < 50000:
            return "Burn rate is manageable. Monitor growth."
        else:
            return "High burn rate! Consider reducing costs or raising funds."

    def report(self):
        print(f"\n📊 {self.name} Financial Report")
        print(f"Cash in Hand: ${self.cash_in_hand}")
        print(f"Monthly Expenses: ${self.monthly_expenses}")
        print(f"Monthly Revenue: ${self.monthly_revenue}")
        print(f"Burn Rate: ${self.burn_rate()}")
        print(f"Runway: {self.runway_months()} months")
        print(f"Advice: {self.advice()}")


# Sample Data
startup = StartupFinance(
    name="ByteBell",
    cash_in_hand=500000,
    monthly_expenses=120000,
    monthly_revenue=60000
)

startup.report()
