import React, { useEffect, useState, useRef } from "react";
import "../../styles/Payment.css";
import CheckoutProduct from "../checkout/CheckoutProduct";
import * as utils from "../../logic/utils";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { PublicKey, Keypair } from "@solana/web3.js";
import { encodeURL, createQR, findReference } from "@solana/pay";
import BigNumber from "bignumber.js";
import { v4 } from "uuid";
import moment from "moment";
import { emptyCart } from "../../redux/features/cart/cartSlice";
import { addOrder } from "../../redux/features/user/userSlice";
import { Connection, clusterApiUrl } from "@solana/web3.js";
import QRCodeModal from "./QRCodeModal";

function Payment() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { profile } = useSelector((state) => state.user);
  const cart = useSelector((state) => state.cart);

  const recipient = new PublicKey(
    "414C5ffjEmZaVdrptaA5TfWWNsLWFVM6aqZfPvwsxsmr"
  );
  const spl_token = new PublicKey(
    "Gvi3gqecizXrhEKpaqKPMz4VduHyu6KULTURKNq577AE"
  );

  const referenceRef = useRef(new Keypair().publicKey);
  const reference = referenceRef.current;

  const amount = new BigNumber(utils.getTotalPrice(cart));
  // const amount = new BigNumber(0.1);

  const label = "My little store";
  const message = "You Bought Some Goodies";

  const solana_pay_url = encodeURL({
    recipient,
    splToken: spl_token,
    amount,
    reference,
    label,
    message,
  });
  console.log("solana_pay_url:", solana_pay_url.href);
  // const solana_pay_url = encodeURL({ recipient, amount, reference, label, message });

  const [succeeded, setSucceeded] = useState(false);
  const [processing, setProcessing] = useState("");
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [qrCode, setQrCode] = useState("");

  const handleModalOpen = () => {
    console.log("Opening modal...");
    setModalOpen(true);
  };
  const handleModalClose = () => {
    console.log("Closing modal...");
    setModalOpen(false);
    setProcessing(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!cart.length) {
      navigate("/orders", { replace: true });
      return;
    }
    !error && setProcessing(true);

    const qr = await createQR(solana_pay_url, 360, "white", "black");
    setQrCode(qr);
    handleModalOpen();

    setProcessing(true);
  };

  const handleChange = (event) => {
    setError(event.error ? event.error.message : "");
  };

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const intervalRef = useRef(null);
  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const signatureInfo = await findReference(connection, reference, {
          finality: "confirmed",
        });
        if (signatureInfo) {
          console.log("Payment confirmed:", signatureInfo);
          clearInterval(intervalRef.current);
          // alert("Payment confirmed successfully!");
          dispatch(
            addOrder({
              order_id: v4(),
              amount: utils.formatter.format(utils.getTotalPrice(cart)),
              created: moment().format("MMMM Do YYYY, h:mma"),
              cart,
            })
          );

          navigate("/orders", { replace: true });
          dispatch(emptyCart());
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
      }
    };

    intervalRef.current = setInterval(checkPaymentStatus, 5000);

    return () => clearInterval(intervalRef.current);
  }, [connection, reference]);

  // useEffect(() => {
  //   if (cart.length === 0) {
  //     requestAnimationFrame(() => {
  //       navigate("/checkout", { replace: true });
  //     });
  //   }
  // }, [cart, navigate]);

  return (
    <div className="payment">
      <div className="payment__container">
        <h1>
          Checkout{" "}
          {
            <Link to="/checkout">
              {!cart.length
                ? "empty"
                : `${cart.length} ${cart.length === 1 ? "item" : "items"}`}
            </Link>
          }
        </h1>

        <div className="payment__section">
          <div className="payment__title">
            <h3>Delivery Address</h3>
          </div>
          <div className="payment__address">
            <p>{profile?.email}</p>
            <p>123 Charles Lane</p>
            <p>Los Angeles, CA</p>
          </div>
        </div>

        <div className="payment__section">
          <div className="payment__title">
            <h3>Review Items and Delivery</h3>
          </div>
          <div className="payment__items">
            {cart?.map((item, index) => (
              <CheckoutProduct
                key={item.id}
                id={item.id}
                index={index}
                title={item.title}
                image={item.image}
                price={item.price}
                rating={item.rating}
              />
            ))}
          </div>
        </div>

        <div className="payment__section">
          <div className="payment__title">
            <h3>Payment Method</h3>
          </div>
          <div className="payment__details">
            <form onSubmit={handleSubmit}>
              {/* <CardElement onChange={handleChange} /> */}

              <div className="payment__priceContainer">
                <div>
                  Order Total :&nbsp;
                  <strong>
                    {utils.formatter.format(utils.getTotalPrice(cart))}
                  </strong>
                </div>
                <button disabled={processing || succeeded}>
                  <span>{processing ? "processing" : "Buy Now"}</span>
                </button>
              </div>
              {error && <div>{error}</div>}
            </form>
          </div>
        </div>
      </div>

      <QRCodeModal
        qrCode={qrCode}
        reference={reference}
        modalOpen={modalOpen}
        handleModalClose={handleModalClose}
      />
    </div>
  );
}

export default Payment;
