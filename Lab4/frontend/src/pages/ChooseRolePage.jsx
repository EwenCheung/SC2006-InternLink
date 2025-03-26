import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ChooseRolePage.module.css';

const ChooseRolePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('ChooseRolePage mounted');
    // Check if the image exists
    const img = new Image();
    img.onload = () => console.log('Logo loaded successfully');
    img.onerror = () => console.error('Error loading logo');
    img.src = '/images/Logo1.png';
  }, []);

  const handleKeyPress = (event, path) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      navigate(path);
    }
  };

  console.log('ChooseRolePage rendering');

  return (
    <main className={styles.container}>
      <div 
        className={styles.card}
        role="region" 
        aria-label="Role selection"
      >
        <div className="space-y-6">
          <section className="relative">
            <img 
              src="/images/Logo1.png" 
              alt="InternLink Logo" 
              className="w-[250px] h-auto mx-auto mb-5 drop-shadow-md"
              loading="eager"
              onError={(e) => {
                console.error('Logo failed to load');
                e.target.style.display = 'none';
              }}
            />
            <h1 className="text-3xl font-semibold text-gray-800 mb-3">
              Welcome to InternLink
            </h1>
            <p className="text-lg text-gray-600">
              Choose your role to continue
            </p>
          </section>

          <nav className="flex flex-col gap-6 items-center" aria-label="User role selection">
            <button
              onClick={() => {
                console.log('Navigating to jobseeker login');
                navigate('/jobseeker/login');
              }}
              onKeyDown={(e) => handleKeyPress(e, '/jobseeker/login')}
              className={`${styles.button} w-[250px] py-4 px-8 rounded-xl text-lg font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2`}
              aria-label="Continue as Job Seeker"
            >
              Job Seeker
            </button>
            <button
              onClick={() => {
                console.log('Navigating to employer login');
                navigate('/employer/login');
              }}
              onKeyDown={(e) => handleKeyPress(e, '/employer/login')}
              className={`${styles.button} w-[250px] py-4 px-8 rounded-xl text-lg font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2`}
              aria-label="Continue as Employer"
            >
              Employer
            </button>
          </nav>
        </div>
      </div>
    </main>
  );
};

export default ChooseRolePage;
