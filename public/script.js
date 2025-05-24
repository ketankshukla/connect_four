/**
 * DEPRECATED: This file is kept for backward compatibility.
 * The application has been refactored to use ES6 modules.
 * Please use the new modular structure in the /js directory.
 */

console.warn('script.js is deprecated. Using the new modular structure in /js directory.');

// Load the new module structure
document.addEventListener('DOMContentLoaded', function() {
    // Create a script element to load the main module
    const script = document.createElement('script');
    script.type = 'module';
    script.src = '/js/main.js';
    script.onerror = function(error) {
        console.error('Failed to load the new module structure:', error);
        document.body.innerHTML = '<div style="text-align: center; margin-top: 50px;"><h1>Error Loading Application</h1><p>There was an error loading the application. Please try refreshing the page or contact support if the issue persists.</p></div>';
    };
    
    // Add the script to the document
    document.head.appendChild(script);
    console.log('Attempting to load new module structure.');
});
