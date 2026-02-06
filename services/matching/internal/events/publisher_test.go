package events

import (
	"context"
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockPublisher is a mock implementation of Publisher
type MockPublisher struct {
	mock.Mock
}

func (m *MockPublisher) PublishTrade(ctx context.Context, event TradeEvent) error {
	args := m.Called(ctx, event)
	return args.Error(0)
}

func (m *MockPublisher) PublishOrderCancelled(ctx context.Context, event OrderCancelledEvent) error {
	args := m.Called(ctx, event)
	return args.Error(0)
}

func (m *MockPublisher) PublishOrderBookEvent(ctx context.Context, event OrderBookEvent) error {
	args := m.Called(ctx, event)
	return args.Error(0)
}

func TestMultiPublisher_PublishTrade(t *testing.T) {
	pub1 := new(MockPublisher)
	pub2 := new(MockPublisher)
	multi := NewMultiPublisher(pub1, pub2)

	event := TradeEvent{MakerOrderID: "1", TakerOrderID: "2"}
	ctx := context.Background()

	// Both succeed
	pub1.On("PublishTrade", ctx, event).Return(nil)
	pub2.On("PublishTrade", ctx, event).Return(nil)

	err := multi.PublishTrade(ctx, event)
	assert.NoError(t, err)

	pub1.AssertExpectations(t)
	pub2.AssertExpectations(t)
}

func TestMultiPublisher_PublishTrade_PartialFailure(t *testing.T) {
	pub1 := new(MockPublisher)
	pub2 := new(MockPublisher)
	multi := NewMultiPublisher(pub1, pub2)

	event := TradeEvent{MakerOrderID: "1", TakerOrderID: "2"}
	ctx := context.Background()

	// First fails, second succeeds. Both should be called.
	pub1.On("PublishTrade", ctx, event).Return(errors.New("fail1"))
	pub2.On("PublishTrade", ctx, event).Return(nil)

	err := multi.PublishTrade(ctx, event)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "fail1")

	pub1.AssertExpectations(t)
	pub2.AssertExpectations(t)
}

func TestMultiPublisher_PublishOrderCancelled(t *testing.T) {
	pub1 := new(MockPublisher)
	multi := NewMultiPublisher(pub1)

	event := OrderCancelledEvent{OrderID: "1"}
	ctx := context.Background()

	pub1.On("PublishOrderCancelled", ctx, event).Return(nil)

	err := multi.PublishOrderCancelled(ctx, event)
	assert.NoError(t, err)

	pub1.AssertExpectations(t)
}

func TestMultiPublisher_PublishOrderBookEvent(t *testing.T) {
	pub1 := new(MockPublisher)
	multi := NewMultiPublisher(pub1)

	event := OrderBookEvent{OrderID: "1"}
	ctx := context.Background()

	pub1.On("PublishOrderBookEvent", ctx, event).Return(nil)

	err := multi.PublishOrderBookEvent(ctx, event)
	assert.NoError(t, err)

	pub1.AssertExpectations(t)
}
