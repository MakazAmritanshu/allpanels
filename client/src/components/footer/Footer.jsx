import React from 'react';
import SecureFooter from '../../assets/securefooter.png';
import plus from '../../assets/18plus.png';
import gamecare from '../../assets/gamecare.png';
import gt from '../../assets/gt.png';
function Footer() {
  return (
    <div>
      <div className='bg-primary text-primary flex flex-col items-center justify-center p-2 lg:flex-row'>
        <div className='lg:underline-none flex w-full items-center justify-center gap-2 text-[12px] font-bold underline lg:justify-start lg:text-[16px]'>
          <span className=''> Terms and Conditions </span>
          <span className=''> Responsible Gaming </span>
        </div>
        <div className='flex w-full items-center justify-center gap-2 lg:justify-start'>
          <h2 className='text-[20px] font-[700] lg:text-[24px]'>
            24X7 Support
          </h2>
        </div>
      </div>
      <div className='flex flex-wrap items-center justify-center gap-2 lg:justify-between'>
        <div className='flex items-center justify-center gap-2'>
          <img
            src={SecureFooter}
            alt='SecureFooter'
            className='max-h-[50px] max-w-[100px]'
          />
          <div className='flex flex-col justify-center'>
            <span className='text-[12px] font-bold lg:text-[16px]'>
              100% SAFE
            </span>
            <span className='text-[12px] leading-1.5 font-[400] whitespace-nowrap lg:text-[16px]'>
              Protected connection and encrypted data.
            </span>
          </div>
        </div>
        <div className='flex items-center justify-center gap-2'>
          <img src={plus} alt='plus' className='max-h-[30px] max-w-[100px]' />
          <img
            src={gamecare}
            alt='gamecare'
            className='max-h-[30px] max-w-[100px]'
          />
          <img src={gt} alt='gt' className='max-h-[30px] max-w-[100px]' />
        </div>
      </div>
      <div className='flex items-center justify-center'>
        <span className='text-center text-[12px] font-[400]'>
          Copyright © 2026 All rights reserved.
        </span>
      </div>
    </div>
  );
}

export default Footer;
