import DepositForm from "../Deposit/DepositForm";

export default function Deposit(props) {
  const { onHide, tokens } = props;

  return (
    <div className="wallet-footer">
      <div className="w-100">
        <h2 className="text-center">Deposit</h2>
        <div className="text-center muted">
          Start Trading and Earning Interest
        </div>
        <DepositForm tokens={tokens} />
      </div>
    </div>
  );
}
