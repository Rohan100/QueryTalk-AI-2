import re

with open('src/components/ChatDashboard.jsx', 'r') as f:
    content = f.read()

# 1. Replace Analytics Placeholder
analytics_pattern = r"\{activeTab === 'analytics' && \([\s\S]*?<p className=\"font-body-sm text-body-sm mt-2\">Visual reports and insights will appear here\.<\/p>\s*<\/div>\s*\)\}"
content = re.sub(analytics_pattern, "{activeTab === 'analytics' && (<AnalyticsDashboard />)}", content)

# 2. Delete duplicate placeholder blocks at the bottom of the content area
# Lines 418-445 in the previous output. Let's find them securely.
duplicates_pattern = r"\{activeTab === 'notifications' && \([\s\S]*?<p className=\"font-body-sm text-body-sm mt-2\">How can we help you today\?<\/p>\s*<\/div>\s*\)\}"
content = re.sub(duplicates_pattern, "", content)

# Also there's an original notifications & security block around line 338. We can leave them or remove them since they are not used. The user didn't complain about them. Let's just fix the Analytics part first to solve the user's explicit issue.

with open('src/components/ChatDashboard.jsx', 'w') as f:
    f.write(content)
print("Cleaned up ChatDashboard placeholders")
