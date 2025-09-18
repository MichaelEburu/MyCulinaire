// Visual Guidance System for MyCulinairee
class VisualGuidance {
    constructor() {
        this.isActive = false;
        this.currentStep = 0;
        this.recipeSteps = [];
        this.cameraStream = null;
        this.overlayElement = null;
        this.techniqueLibrary = this.initializeTechniqueLibrary();
        this.intervalId = null;
    }

    initializeTechniqueLibrary() {
        return {
            'knife_tilt': {
                name: 'Proper Knife Tilt',
                description: 'Tilt the knife at a 45-degree angle for better cutting control',
                image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
                gif: 'https://media.giphy.com/media/3o7btPCcdNnyx0x8Eo/giphy.gif',
                instructions: [
                    'Hold the knife handle firmly',
                    'Position the blade at a 45-degree angle to the cutting board',
                    'Use a rocking motion while cutting',
                    'Keep your fingers curled under for safety'
                ]
            },
            'sauté': {
                name: 'Sautéing Technique',
                description: 'Cook food quickly in a small amount of oil over high heat',
                image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
                gif: 'https://media.giphy.com/media/3o7btPCcdNnyx0x8Eo/giphy.gif',
                instructions: [
                    'Heat oil in a pan over medium-high heat',
                    'Add ingredients in small batches',
                    'Stir constantly with a wooden spoon',
                    'Cook until ingredients are tender and lightly browned'
                ]
            },
            'chopping': {
                name: 'Basic Chopping',
                description: 'Cut ingredients into small, uniform pieces',
                image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
                gif: 'https://media.giphy.com/media/3o7btPCcdNnyx0x8Eo/giphy.gif',
                instructions: [
                    'Use a sharp knife for clean cuts',
                    'Keep the tip of the knife on the cutting board',
                    'Use a rocking motion with the blade',
                    'Maintain consistent size for even cooking'
                ]
            },
            'stirring': {
                name: 'Proper Stirring',
                description: 'Mix ingredients evenly while cooking',
                image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
                gif: 'https://media.giphy.com/media/3o7btPCcdNnyx0x8Eo/giphy.gif',
                instructions: [
                    'Use a wooden spoon or spatula',
                    'Stir from the bottom to prevent sticking',
                    'Move in a figure-8 pattern for even mixing',
                    'Don\'t over-stir delicate ingredients'
                ]
            }
        };
    }

    // Initialize visual guidance for a recipe
    initializeVisualGuidance(recipe) {
        this.recipeSteps = this.parseRecipeSteps(recipe);
        this.createVisualGuidanceUI();
        this.setupCameraAccess();
    }

    parseRecipeSteps(recipe) {
        const steps = [];
        if (recipe.strInstructions) {
            // Split by numbered steps (1., 2., 3., etc.)
            const instructions = recipe.strInstructions.split(/(?=\d+\.)/);
            let stepCounter = 1;
            
            instructions.forEach((instruction, index) => {
                if (instruction.trim()) {
                    // Clean up the instruction (remove leading number and extra spaces)
                    const cleanInstruction = instruction.trim().replace(/^\d+\.\s*/, '');
                    
                    // Break down long instructions into smaller steps
                    const brokenSteps = this.breakDownLongInstruction(cleanInstruction);
                    
                    brokenSteps.forEach((step, stepIndex) => {
                        const technique = this.detectCookingTechnique(step);
                        steps.push({
                            step: stepCounter,
                            instruction: step,
                            technique: technique,
                            visualGuide: this.techniqueLibrary[technique] || null
                        });
                        stepCounter++;
                    });
                }
            });
        }
        return steps;
    }

    breakDownLongInstruction(instruction) {
        // If instruction is short enough, return as single step
        if (instruction.length <= 80) {
            return [instruction];
        }
        
        const steps = [];
        const sentences = instruction.split(/[.!?]+/).filter(s => s.trim().length > 0);
        
        // If only one sentence but too long, try to break by commas
        if (sentences.length === 1) {
            const parts = instruction.split(',').map(p => p.trim()).filter(p => p.length > 0);
            if (parts.length > 1) {
                // Group parts into reasonable chunks
                let currentStep = '';
                for (let i = 0; i < parts.length; i++) {
                    const part = parts[i];
                    if (currentStep.length + part.length + 2 <= 80) {
                        currentStep += (currentStep ? ', ' : '') + part;
                    } else {
                        if (currentStep) {
                            steps.push(currentStep + '.');
                            currentStep = part;
                        } else {
                            steps.push(part + '.');
                        }
                    }
                }
                if (currentStep) {
                    steps.push(currentStep + '.');
                }
                return steps.length > 0 ? steps : [instruction];
            }
        }
        
        // Break by sentences
        let currentStep = '';
        for (let i = 0; i < sentences.length; i++) {
            const sentence = sentences[i].trim();
            if (currentStep.length + sentence.length + 2 <= 100) {
                currentStep += (currentStep ? ' ' : '') + sentence;
            } else {
                if (currentStep) {
                    steps.push(currentStep + '.');
                    currentStep = sentence;
                } else {
                    steps.push(sentence + '.');
                }
            }
        }
        if (currentStep) {
            steps.push(currentStep + '.');
        }
        
        return steps.length > 0 ? steps : [instruction];
    }


    detectCookingTechnique(instruction) {
        const lowerInstruction = instruction.toLowerCase();
        
        if (lowerInstruction.includes('chop') || lowerInstruction.includes('dice') || lowerInstruction.includes('cut')) {
            return 'chopping';
        } else if (lowerInstruction.includes('sauté') || lowerInstruction.includes('fry') || lowerInstruction.includes('brown')) {
            return 'sauté';
        } else if (lowerInstruction.includes('stir') || lowerInstruction.includes('mix') || lowerInstruction.includes('combine')) {
            return 'stirring';
        } else if (lowerInstruction.includes('boil') || lowerInstruction.includes('boiling')) {
            return 'boiling';
        } else if (lowerInstruction.includes('season') || lowerInstruction.includes('salt') || lowerInstruction.includes('pepper')) {
            return 'seasoning';
        } else if (lowerInstruction.includes('knife') || lowerInstruction.includes('slice')) {
            return 'knife_tilt';
        }
        
        return 'chopping'; // Default technique
    }

    async generateVisualGuidance(instruction, technique) {
        const lowerInstruction = instruction.toLowerCase();
        const guidance = {
            cameraPosition: "Keep your camera at eye level for a good view",
            techniqueTips: [],
            visualCues: []
        };

        // Camera positioning based on technique
        if (technique === 'chopping') {
            guidance.cameraPosition = "Lower your camera to see your cutting board clearly";
            guidance.techniqueTips.push("Hold the knife at a 45-degree angle");
            guidance.techniqueTips.push("Keep your fingers curled under when holding ingredients");
            guidance.techniqueTips.push("Use a steady, controlled cutting motion");
        } else if (technique === 'sauté') {
            guidance.cameraPosition = "Position camera to see the pan and your stirring motion";
            guidance.techniqueTips.push("Keep the pan moving constantly");
            guidance.techniqueTips.push("Use a wooden spoon or spatula for stirring");
            guidance.techniqueTips.push("Don't overcrowd the pan - ingredients should sizzle");
        } else if (technique === 'boiling') {
            guidance.cameraPosition = "Keep camera at medium height to see the pot";
            guidance.techniqueTips.push("Watch for bubbles breaking the surface");
            guidance.techniqueTips.push("Stir occasionally to prevent sticking");
            guidance.techniqueTips.push("Use a timer for precise cooking times");
        } else if (technique === 'stirring') {
            guidance.cameraPosition = "Lower camera to see your mixing bowl";
            guidance.techniqueTips.push("Use a folding motion for delicate ingredients");
            guidance.techniqueTips.push("Mix gently to avoid overworking");
            guidance.techniqueTips.push("Scrape the sides of the bowl regularly");
        } else if (technique === 'seasoning') {
            guidance.cameraPosition = "Position camera to see your seasoning hand";
            guidance.techniqueTips.push("Taste as you season");
            guidance.techniqueTips.push("Start with small amounts and adjust");
            guidance.techniqueTips.push("Mix well after adding seasonings");
        }

        // Add specific visual cues based on ingredients
        if (lowerInstruction.includes('onion')) {
            guidance.techniqueTips.push("Cut onion in half first, then slice parallel to the root");
            guidance.techniqueTips.push("Keep the root end intact while cutting for stability");
        }
        
        if (lowerInstruction.includes('garlic')) {
            guidance.techniqueTips.push("Use the flat side of the knife to crush garlic first");
            guidance.techniqueTips.push("Then mince finely with a rocking motion");
        }

        if (lowerInstruction.includes('carrot')) {
            guidance.techniqueTips.push("Cut carrots into uniform pieces for even cooking");
            guidance.techniqueTips.push("Trim the ends first, then cut into rounds or strips");
        }

        if (lowerInstruction.includes('tomato')) {
            guidance.techniqueTips.push("Use a serrated knife for clean cuts");
            guidance.techniqueTips.push("Cut tomatoes on a stable surface to prevent slipping");
        }

        if (lowerInstruction.includes('meat') || lowerInstruction.includes('chicken') || lowerInstruction.includes('beef')) {
            guidance.techniqueTips.push("Let meat come to room temperature before cooking");
            guidance.techniqueTips.push("Pat meat dry with paper towels for better browning");
        }

        if (lowerInstruction.includes('pasta')) {
            guidance.techniqueTips.push("Use plenty of salted water - it should taste like the sea");
            guidance.techniqueTips.push("Stir pasta immediately after adding to prevent sticking");
        }

        if (lowerInstruction.includes('rice')) {
            guidance.techniqueTips.push("Rinse rice until water runs clear");
            guidance.techniqueTips.push("Use the right water-to-rice ratio (usually 2:1)");
        }

        // Try to get AI-enhanced tips
        try {
            const aiTips = await this.getAIVisualTips(instruction, technique);
            if (aiTips && aiTips.length > 0) {
                guidance.techniqueTips = [...guidance.techniqueTips, ...aiTips];
            }
        } catch (error) {
            console.log('AI tips unavailable, using static tips only');
        }

        return guidance;
    }

    async getAIVisualTips(instruction, technique) {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: `Give me 2-3 specific visual cooking tips for this instruction: "${instruction}". Focus on camera positioning and technique advice for someone cooking with a camera.`,
                    pantryIngredients: []
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const tips = data.message.split('\n').filter(tip => tip.trim().length > 0);
            return tips.slice(0, 3); // Limit to 3 tips
            
        } catch (error) {
            console.error('AI Visual Tips Error:', error);
            return [];
        }
    }

    showVisualGuidanceTips(visualGuidance) {
        // Update camera position in the status indicator
        const statusElement = document.getElementById('status-indicator');
        if (statusElement) {
            statusElement.innerHTML = `<i class="fas fa-camera"></i><span>${visualGuidance.cameraPosition}</span>`;
        }

        // Show technique tips in the step content area
        const tipElement = document.getElementById('technique-tip');
        if (visualGuidance.techniqueTips && visualGuidance.techniqueTips.length > 0) {
            const tipsText = visualGuidance.techniqueTips.join(' • ');
            tipElement.innerHTML = `<strong>Pro Tips:</strong> ${tipsText}`;
        }

        // Update overlay tips (only technique tips, not camera position)
        const overlayTips = document.getElementById('overlay-tips');
        if (overlayTips && visualGuidance.techniqueTips && visualGuidance.techniqueTips.length > 0) {
            const tipsText = visualGuidance.techniqueTips.join(' • ');
            overlayTips.textContent = tipsText;
        }

        // Hide camera tips overlay since it's already shown in status indicator
        const cameraTipsOverlay = document.getElementById('camera-tips-overlay');
        if (cameraTipsOverlay) {
            cameraTipsOverlay.style.display = 'none';
        }
    }

    createVisualGuidanceUI() {
        // Create the visual guidance modal
        const modal = document.createElement('div');
        modal.id = 'visual-guidance-modal';
        modal.className = 'visual-guidance-modal';
        modal.innerHTML = `
            <div class="visual-guidance-content">
                <div class="visual-guidance-header">
                    <h2><i class="fas fa-eye"></i> Visual Cooking Guide</h2>
                    <button class="close-visual-guide" onclick="visualGuidance.closeVisualGuide()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="visual-guidance-body">
                    <!-- Step Navigation -->
                    <div class="step-navigation" id="step-navigation" style="display: none;">
                        <button id="prev-step" class="nav-btn prev-btn">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <div class="step-indicator">
                            <span id="current-step-number">1</span> / <span id="total-steps">${this.recipeSteps.length}</span>
                        </div>
                        <button id="next-step-nav" class="nav-btn next-btn">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>

                    <!-- Camera View -->
                    <div class="camera-container">
                        <video id="cooking-camera" autoplay muted></video>
                        <div class="camera-overlay" id="camera-overlay">
                            <!-- Camera Status -->
                            <div class="camera-status">
                                <div class="status-indicator" id="status-indicator">
                                    <i class="fas fa-camera"></i>
                                    <span>Camera Ready</span>
                                </div>
                            </div>
                            
                            <!-- Current Instruction Overlay -->
                            <div class="instruction-overlay" id="instruction-overlay">
                                <h3 id="overlay-instruction">Ready to start cooking!</h3>
                            </div>
                            
                            <!-- Pro Tips Overlay -->
                            <div class="tips-overlay" id="tips-overlay">
                                <div class="tips-content">
                                    <i class="fas fa-lightbulb"></i>
                                    <span id="overlay-tips">Click play to begin your visual guide</span>
                                </div>
                            </div>
                            
                            <!-- Camera Position Tips -->
                            <div class="camera-tips-overlay" id="camera-tips-overlay">
                                <div class="camera-tips-content">
                                    <i class="fas fa-video"></i>
                                    <span id="overlay-camera-tips">Position your camera at eye level</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Step Content -->
                    <div class="step-content" id="step-content">
                        <div class="step-instruction">
                            <h3 id="current-instruction">Ready to start cooking!</h3>
                            <p id="technique-tip">Click the play button to begin your visual guide</p>
                        </div>
                        
                        <div class="technique-demo" id="technique-demo" style="display: none;">
                            <h4>Technique Demonstration</h4>
                            <div class="demo-content">
                                <img id="technique-image" src="" alt="Technique demonstration">
                                <div class="demo-instructions">
                                    <h5 id="technique-name"></h5>
                                    <p id="technique-description"></p>
                                    <ul id="technique-steps"></ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Controls -->
                    <div class="visual-controls">
                        <button id="start-visual-guide" class="btn-primary visual-guide-btn">
                            <i class="fas fa-play"></i> Start Visual Guide
                        </button>
                        <button id="pause-visual-guide" class="btn-secondary visual-guide-btn" style="display: none;">
                            <i class="fas fa-pause"></i> Pause
                        </button>
                        <button id="finish-guide" class="btn-primary visual-guide-btn" style="display: none;">
                            <i class="fas fa-check"></i> Finish Guide
                        </button>
                    </div>

                    <!-- Swipe Instructions -->
                    <div class="swipe-instructions" id="swipe-instructions" style="display: none;">
                        <p><i class="fas fa-hand-paper"></i> Swipe left/right or use arrow buttons to navigate steps</p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.overlayElement = document.getElementById('camera-overlay');
        
        // Add event listeners
        this.setupEventListeners();
        this.setupSwipeGestures();
    }

    setupEventListeners() {
        document.getElementById('start-visual-guide').addEventListener('click', () => {
            this.startVisualGuide();
        });
        
        document.getElementById('pause-visual-guide').addEventListener('click', () => {
            this.pauseVisualGuide();
        });
        
        document.getElementById('finish-guide').addEventListener('click', () => {
            this.completeVisualGuide();
        });

        document.getElementById('prev-step').addEventListener('click', () => {
            this.previousStep();
        });

        document.getElementById('next-step-nav').addEventListener('click', () => {
            this.nextStep();
        });
    }

    setupSwipeGestures() {
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;
        const minSwipeDistance = 50;

        const cameraContainer = document.getElementById('cooking-camera');
        
        cameraContainer.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });

        cameraContainer.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            
            // Check if it's a horizontal swipe (not vertical)
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
                if (deltaX > 0) {
                    // Swipe right - previous step
                    this.previousStep();
                } else {
                    // Swipe left - next step
                    this.nextStep();
                }
            }
        }, { passive: true });

        // Also support mouse drag for desktop
        let isMouseDown = false;
        cameraContainer.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            startX = e.clientX;
            startY = e.clientY;
        });

        cameraContainer.addEventListener('mouseup', (e) => {
            if (isMouseDown) {
                isMouseDown = false;
                endX = e.clientX;
                endY = e.clientY;
                
                const deltaX = endX - startX;
                const deltaY = endY - startY;
                
                if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
                    if (deltaX > 0) {
                        this.previousStep();
                    } else {
                        this.nextStep();
                    }
                }
            }
        });
    }

    async setupCameraAccess() {
        try {
            this.cameraStream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'user',
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                } 
            });
            
            const video = document.getElementById('cooking-camera');
            video.srcObject = this.cameraStream;
            
            console.log('Camera access granted');
        } catch (error) {
            console.error('Error accessing camera:', error);
            this.showCameraError();
        }
    }

    showCameraError() {
        const overlay = document.getElementById('camera-overlay');
        overlay.innerHTML = `
            <div class="camera-error">
                <i class="fas fa-camera-slash"></i>
                <h3>Camera Access Required</h3>
                <p>Please allow camera access to use the visual guidance feature.</p>
                <button class="btn-primary" onclick="location.reload()">Refresh Page</button>
            </div>
        `;
    }

    startVisualGuide() {
        this.isActive = true;
        this.currentStep = 0;
        
        // Update UI
        document.getElementById('start-visual-guide').style.display = 'none';
        document.getElementById('pause-visual-guide').style.display = 'inline-block';
        document.getElementById('finish-guide').style.display = 'inline-block';
        document.getElementById('step-navigation').style.display = 'flex';
        document.getElementById('swipe-instructions').style.display = 'block';
        
        // Start the first step
        this.showCurrentStep();
        
        // Start monitoring for technique recognition
        this.startTechniqueMonitoring();
    }

    pauseVisualGuide() {
        this.isActive = false;
        
        // Update UI
        document.getElementById('start-visual-guide').style.display = 'inline-block';
        document.getElementById('pause-visual-guide').style.display = 'none';
        
        // Stop monitoring
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    nextStep() {
        if (this.currentStep < this.recipeSteps.length - 1) {
            this.currentStep++;
            this.showCurrentStep();
        } else {
            this.completeVisualGuide();
        }
    }

    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.showCurrentStep();
        }
    }

    async showCurrentStep() {
        const step = this.recipeSteps[this.currentStep];
        const instructionElement = document.getElementById('current-instruction');
        const tipElement = document.getElementById('technique-tip');
        const currentStepNumber = document.getElementById('current-step-number');
        const totalSteps = document.getElementById('total-steps');
        const prevBtn = document.getElementById('prev-step');
        const nextBtn = document.getElementById('next-step-nav');
        
        // Update both the step content and overlay
        instructionElement.textContent = step.instruction;
        
        // Update overlay instruction
        const overlayInstruction = document.getElementById('overlay-instruction');
        if (overlayInstruction) {
            overlayInstruction.textContent = step.instruction;
        }
        
        // Generate visual guidance tips based on the instruction
        const visualGuidance = await this.generateVisualGuidance(step.instruction, step.technique);
        
        if (step.visualGuide) {
            tipElement.textContent = `Technique: ${step.visualGuide.name}`;
            this.showTechniqueDemo(step.visualGuide);
        } else {
            tipElement.textContent = 'Follow the instructions carefully';
            this.hideTechniqueDemo();
        }
        
        // Show visual guidance tips on overlay
        this.showVisualGuidanceTips(visualGuidance);
        
        // Update step numbers
        currentStepNumber.textContent = this.currentStep + 1;
        totalSteps.textContent = this.recipeSteps.length;
        
        // Update navigation buttons
        prevBtn.disabled = this.currentStep === 0;
        nextBtn.disabled = this.currentStep === this.recipeSteps.length - 1;
        
        // Update button text for last step
        if (this.currentStep === this.recipeSteps.length - 1) {
            nextBtn.innerHTML = '<i class="fas fa-check"></i>';
        } else {
            nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        }
        
        // Update progress
        this.updateProgress();
    }

    showTechniqueDemo(technique) {
        const demo = document.getElementById('technique-demo');
        const image = document.getElementById('technique-image');
        const name = document.getElementById('technique-name');
        const description = document.getElementById('technique-description');
        const steps = document.getElementById('technique-steps');
        
        image.src = technique.image;
        name.textContent = technique.name;
        description.textContent = technique.description;
        
        steps.innerHTML = '';
        technique.instructions.forEach(instruction => {
            const li = document.createElement('li');
            li.textContent = instruction;
            steps.appendChild(li);
        });
        
        demo.style.display = 'block';
    }

    hideTechniqueDemo() {
        document.getElementById('technique-demo').style.display = 'none';
    }

    startTechniqueMonitoring() {
        // Simulate real-time technique recognition
        this.intervalId = setInterval(() => {
            if (this.isActive) {
                this.analyzeCurrentTechnique();
            }
        }, 2000);
    }

    analyzeCurrentTechnique() {
        // This would integrate with computer vision APIs in a real implementation
        // For now, we'll simulate technique recognition
        const step = this.recipeSteps[this.currentStep];
        if (step.visualGuide) {
            this.provideRealTimeFeedback(step.visualGuide);
        }
    }

    provideRealTimeFeedback(technique) {
        const overlay = this.overlayElement;
        const feedback = document.createElement('div');
        feedback.className = 'real-time-feedback';
        
        // Simulate different feedback based on technique
        const feedbackMessages = {
            'knife_tilt': [
                'Good knife angle!',
                'Try tilting the knife more',
                'Perfect cutting motion!',
                'Keep your fingers safe!'
            ],
            'sauté': [
                'Great stirring motion!',
                'Keep the heat steady',
                'Perfect browning!',
                'Don\'t over-stir!'
            ],
            'chopping': [
                'Nice even cuts!',
                'Try to keep pieces more uniform',
                'Great knife control!',
                'Watch your fingers!'
            ],
            'stirring': [
                'Good mixing technique!',
                'Stir from the bottom',
                'Perfect consistency!',
                'Keep it moving!'
            ]
        };
        
        const messages = feedbackMessages[technique.name.toLowerCase().replace(' ', '_')] || 
                        ['Looking good!', 'Keep it up!', 'Great technique!'];
        
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        feedback.textContent = randomMessage;
        
        overlay.appendChild(feedback);
        
        // Remove feedback after 3 seconds
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 3000);
    }

    updateProgress() {
        const progress = ((this.currentStep + 1) / this.recipeSteps.length) * 100;
        document.getElementById('progress-fill').style.width = `${progress}%`;
    }

    completeVisualGuide() {
        this.isActive = false;
        
        // Show completion message
        const overlay = this.overlayElement;
        overlay.innerHTML = `
            <div class="completion-message">
                <i class="fas fa-check-circle"></i>
                <h3>Congratulations!</h3>
                <p>You've completed the visual cooking guide!</p>
                <button class="btn-primary" onclick="visualGuidance.closeVisualGuide()">
                    Finish
                </button>
            </div>
        `;
        
        // Stop monitoring
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    closeVisualGuide() {
        // Stop camera stream
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
        }
        
        // Remove modal
        const modal = document.getElementById('visual-guidance-modal');
        if (modal) {
            modal.remove();
        }
        
        // Reset state
        this.isActive = false;
        this.currentStep = 0;
        this.recipeSteps = [];
        
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    // Method to be called from recipe cards
    showVisualGuidance(recipe) {
        this.initializeVisualGuidance(recipe);
        document.getElementById('visual-guidance-modal').style.display = 'flex';
    }
}

// Initialize global instance
const visualGuidance = new VisualGuidance();
