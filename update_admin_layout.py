
import os
import re

file_path = r'c:\Users\k\Desktop\ElectriToy\Frontend\src\modules\admin\layout\AdminLayout.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

new_click_handler = """                            onClick={() => {
                                                                console.log("Notification Clicked:", notif);
                                                                if (!notif.isRead) toggleRead(notif._id);
                                                                
                                                                // Redirect if it's an order notification
                                                                if (notif.type === 'order') {
                                                                    if (notif.referenceId) {
                                                                        console.log("Navigating to detail page:", notif.referenceId);
                                                                        navigate(`/admin/orders/${notif.referenceId}`);
                                                                    } else {
                                                                        console.log("No referenceId found, navigating to list page");
                                                                        navigate('/admin/orders');
                                                                    }
                                                                    setIsNotifOpen(false);
                                                                }
                                                            }}"""

# Regex to find the existing onClick block and replace it
# We search for the block that has "Redirect if it's an order notification"
content = re.sub(
    r'onClick=\{\(\) => \{.*?Redirect if it\'s an order notification.*?\}\s*\}',
    new_click_handler,
    content,
    flags=re.DOTALL
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("AdminLayout.jsx updated successfully")
