interface MoneyCounterProps {
  value: number;
}

export const MoneyCounter = ({ value }: MoneyCounterProps) => (
  <div
    style={{
      position: 'absolute',
      top: '10px',
      right: '10px',
      fontSize: '20px',
      color: 'white',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: '5px 10px',
      borderRadius: '5px',
      zIndex: 100,
    }}
  >
    $ {value}
  </div>
); 