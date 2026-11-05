import React from 'react'
import { Input, Row, Col, Icon } from 'antd'
import './style.css'
const FormInput = ({
  placeholder,
  disabled,
  input,
  label,
  classLabel,
  classInput,
  type,
  meta: { touched, error }
}) => {
  const suffix =
    input.type === 'percentage' ? (
      <span style={{ color: '#535E7A' }}>USD</span>
    ) : (
      <span />
    )

  return (
    <div className={`form-group ${error && touched ? 'has-error' : ''}`}>
      <Row gutter={0}>
        <Col span={3}>
          {label && (
            <label htmlFor={input.name} className="label-name">
              {label}
            </label>
          )}
        </Col>
        <Col span={12}>
          <div className="ant-form">
            {input.type !== 'password' ? (
              <Input
                placeholder={placeholder}
                {...input}
                disabled={disabled}
                className={classInput}
                type="text"
                suffix={suffix}
              />
            ) : (
              <Input.Password placeholder="input password" {...input} />
            )}
            {error && touched && (
              <div className="text-danger">
                <strong>{error}</strong>
              </div>
            )}
          </div>
        </Col>
      </Row>
    </div>
  )
}

export default FormInput
