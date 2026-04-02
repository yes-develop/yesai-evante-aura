import React from 'react';

const AIAssistant = ({ analysis, suggestions, onSuggestionClick }) => {
    return (
        <div className="ai-assistant">
            <h2>AI Assistant</h2>
            <p>{analysis}</p>
            <div className="suggestions">
                <h4>Suggested Responses:</h4>
                <ul>
                    {suggestions.map((suggestion, index) => (
                        <li key={index} onClick={() => onSuggestionClick(suggestion)}>
                            {suggestion}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="ai-actions">
                <button onClick={() => onSuggestionClick('Generate Response')}>Generate Response</button>
                <button onClick={() => onSuggestionClick('Summarize')}>Summarize</button>
            </div>
        </div>
    );
};

export default AIAssistant;