const chatData = {
    'john': {
        name: 'John Doe',
        avatar: 'https://via.placeholder.com/40',
        badge: 'Customer',
        status: 'status-online',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        location: 'New York, USA',
        about: 'John is a customer who has been with us since January 2023. He\'s primarily interested in our premium subscription plans and has active support tickets regarding API integration.',
        messages: [
            { sender: 'john', text: 'Hello! I have some questions about your services.', time: '12:40' },
            { sender: 'me', text: 'Hi there! I\'d be happy to help. What would you like to know?', time: '12:42' },
            { sender: 'john', text: 'How much does your premium plan cost?', time: '12:45' }
        ],
        suggestions: [
            'Our premium plan costs ฿499/month with all features included.',
            'Would you like me to send you our detailed pricing guide?',
            'The premium plan includes unlimited access to all our features and priority support.'
        ],
        analysis: 'The customer is interested in our premium plan pricing.'
    },
    'jane': {
        name: 'Jane Smith',
        avatar: 'https://via.placeholder.com/40',
        badge: 'Prospect',
        status: 'status-away',
        email: 'jane.smith@example.com',
        phone: '+1 (555) 987-6543',
        location: 'Los Angeles, USA',
        about: 'Jane is a new prospect who reached out through our website contact form. She\'s exploring options for her e-commerce business and comparing several solutions.',
        messages: [
            { sender: 'jane', text: 'I\'m interested in your product...', time: '09:30' },
            { sender: 'me', text: 'That\'s great! What specific features are you looking for?', time: '09:35' }
        ],
        suggestions: [
            'We offer a 14-day free trial if you\'d like to test our product.',
            'I can schedule a demo call to show you the key features.',
            'Our product is designed to help businesses like yours achieve better results.'
        ],
        analysis: 'This customer is in the research phase and needs more information about our product.'
    },
    'mark': {
        name: 'Mark Johnson',
        avatar: 'https://via.placeholder.com/40',
        badge: 'Enterprise',
        status: 'status-offline',
        email: 'mark.johnson@bigcorp.com',
        phone: '+1 (555) 456-7890',
        location: 'Chicago, USA',
        about: 'Mark represents BigCorp Inc., one of our enterprise clients. They\'ve been using our platform for their 500+ employees for the past 8 months.',
        messages: [
            { sender: 'mark', text: 'I\'m having an issue with logging in.', time: '10:15' },
            { sender: 'me', text: 'I\'m sorry to hear that. Could you describe the issue in more detail?', time: '10:20' },
            { sender: 'mark', text: 'It says "invalid credentials" but I\'m sure my password is correct.', time: '10:22' },
            { sender: 'me', text: 'Let me reset your password for you. Please check your email in a few minutes.', time: '10:25' },
            { sender: 'mark', text: 'Thank you for your help!', time: 'Yesterday' }
        ],
        suggestions: [
            'Is there anything else I can help you with today?',
            'Please let me know if you encounter any further issues.',
            'Would you mind rating your support experience?'
        ],
        analysis: 'Technical issue resolved. Customer seems satisfied with the support.'
    }
};

export default chatData;