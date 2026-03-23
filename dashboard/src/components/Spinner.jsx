// import React, { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { useSelector } from "react-redux";
// const Spinner = ({ path = "" }) => {
//     const [count, setCount] = useState(3);
//     const navigate = useNavigate();
//     const location = useLocation();
//     const { userInfo } = useSelector((state) => state.auth);

//     useEffect(() => {
//         const interval = setInterval(() => {
//             setCount((prevValue) => --prevValue);
//         }, 1000);
//         if(userInfo){
//             navigate({
//                 state: location.pathname,
//             });
//         }
//         count === 0 &&
//             navigate(`/${path}`, {
//                 state: location.pathname,
//             });
//         return () => clearInterval(interval);
//     }, [count, navigate, location, path]);
//     return (
//         <>
//         {count !== 0 ?
//           /* From Uiverse.io by clarencedion */
// <div className="flex items-center justify-center fixed h-full w-full bg-[#00000032]">
//   <div className="relative">
//     <div className="relative w-32 h-32">
//       <div
//         className="absolute w-full h-full rounded-full border-[3px] border-gray-100/10 border-r-[#14805e] border-b-[#14805e] animate-spin"
//         style={{ animationDuration: '3s' }}
//       ></div>

//       <div
//         className="absolute w-full h-full rounded-full border-[3px] border-gray-100/10 border-t-[#14805e] animate-spin"
//         style={{ animationDuration: '2s', animationDirection: 'reverse' }}
//       ></div>
//     </div>

//     <div
//       className="absolute inset-0 bg-gradient-to-tr from-[#0ff]/10 via-transparent to-[#0ff]/5 animate-pulse rounded-full blur-sm"
//     ></div>
//   </div>
// </div>

//         : ""}
//         </>
//     );
// };

// export default Spinner;

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
const Spinner = ({ path = '' }) => {
  const [count, setCount] = useState(3);
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prevValue) => --prevValue);
    }, 1000);
    if (userInfo) {
      navigate({
        state: location.pathname,
      });
    }
    count === 0 &&
      navigate(`/${path}`, {
        state: location.pathname,
      });
    return () => clearInterval(interval);
  }, [count, navigate, location, path]);
  return (
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

export default Spinner;

// import React from "react";

// const Spinner = () => {
//   return (
//     <div className="flex items-center justify-center h-screen bg-gray-100">
//       <div className="bg-white h-[150px] w-[200px] rounded-[20px] mx-auto overflow-hidden flex flex-col justify-center items-center shadow-lg">
//         <div className="relative">
//           <div className="w-12 h-12 rounded-full border-4 border-gray-200"></div>
//           <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin absolute top-0 left-0"></div>
//         </div>
//         <p className="mt-4 text-gray-600 text-sm">Loading...</p>
//       </div>
//     </div>
//   );
// };

// export default Spinner;
