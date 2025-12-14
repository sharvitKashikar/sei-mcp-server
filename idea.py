# Startup Idea Validation Tool

class StartupIdea:
    def __init__(self, idea_name, problem_score, market_size, competition_level):
        self.idea_name = idea_name
        self.problem_score = problem_score      # 1 to 10
        self.market_size = market_size          # 1 to 10
        self.competition_level = competition_level  # 1 to 10

    def validation_score(self):
        score = (self.problem_score * 0.4) + \
                (self.market_size * 0.4) - \
                (self.competition_level * 0.2)
        return round(score, 2)

    def verdict(self):
        score = self.validation_score()
        if score >= 7:
            return "Strong idea 🚀"
        elif score >= 5:
            return "Moderate idea ⚖️"
        else:
            return "Weak idea ❌"

    def show_result(self):
        print(f"\n💡 Startup Idea: {self.idea_name}")
        print(f"Validation Score: {self.validation_score()}/10")
        print(f"Verdict: {self.verdict()}")


# Sample Usage
idea = StartupIdea(
    idea_name="AI Resume Screener",
    problem_score=8,
    market_size=7,
    competition_level=5
)

idea.show_result()
