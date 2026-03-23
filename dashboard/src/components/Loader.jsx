import React from 'react';
import './Loader.css';

const Loader = () => {
  return (
    //     <div class="dot-spinner">
    //     <div class="dot-spinner__dot"></div>
    //     <div class="dot-spinner__dot"></div>
    //     <div class="dot-spinner__dot"></div>
    //     <div class="dot-spinner__dot"></div>
    //     <div class="dot-spinner__dot"></div>
    //     <div class="dot-spinner__dot"></div>
    //     <div class="dot-spinner__dot"></div>
    //     <div class="dot-spinner__dot"></div>
    // </div>
    <>
      <div className='mx-auto flex h-[116px] w-[185px] items-center justify-center overflow-hidden rounded-[20px] bg-white'>
        <div className='loader'>
          <div className='bg-white'>
            <svg
              className='h-[200px] w-[120px] rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.0)]'
              xmlns='http://www.w3.org/2000/svg'
              version='1.1'
            >
              <rect width='100%' height='100%' fill='white' rx='16' ry='16' />
              <defs>
                <filter id='goo'>
                  <feGaussianBlur
                    in='SourceGraphic'
                    stdDeviation='6'
                    result='blur'
                  />
                  <feColorMatrix
                    in='blur'
                    mode='matrix'
                    values='1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7'
                    result='goo'
                  />
                  <feBlend in='SourceGraphic' in2='goo' />
                </filter>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </>
  );
};

export default Loader;
